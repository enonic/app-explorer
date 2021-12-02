import {
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	VALUE_TYPE_STRING,
	camelize,
	forceArray,
	sortKeys,
	//toStr,
	ucFirst
} from '@enonic/js-utils';
import setIn from 'set-value'; // Number.isInteger and Reflect

import {GraphQLString} from '/lib/graphql';

import {
	GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTIES,
	GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT
} from '../constants';
import {documentTypeNameToGraphQLObjectTypeName} from './documentTypeNameToGraphQLObjectTypeName';
import {objToGraphQL} from './objToGraphQL';
import {valueTypeToGraphQLType} from './valueTypeToGraphQLType';

import {addDynamicEnumTypes} from './addDynamicEnumTypes';
import {addDynamicInputTypes} from './addDynamicInputTypes';
import {addDynamicInterfaceTypes} from './addDynamicInterfaceTypes';
import {addDynamicObjectTypes} from './addDynamicObjectTypes';


const VALUE_TYPE_VARIANTS = [
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	VALUE_TYPE_STRING
];

/*──────────────────────────────────────────────────────────────────────────────
An objectType per documentType will be generated.
Global and "magic" fields will be added to an interfaceType.
The list of objectTypes is used in the interfaceType resolver.
When we define the resolvers we may use a js-reference to an empty object, which later will contain the objectTypes.
Q: Can we use lib-graphql.reference in objectType.interfaces?
──────────────────────────────────────────────────────────────────────────────*/

export function addDynamicTypes({
	allFieldKeys,
	camelToFieldObj,
	documentTypes,
	globalFieldsObj,
	glue,
	interfaceSearchHitsHighlightsFields
}) {
	const documentTypeObjectTypes = {}; // Defined before addDynamicInterfaceTypes, populated after

	// Must be before addDynamicObjectTypes
	addDynamicInterfaceTypes({
		documentTypeObjectTypes, // Just an empty obj, populated later
		glue,
		interfaceSearchHitsHighlightsFields,
		globalFieldsObj
	});

	const interfaceTypeDocument = glue.getInterfaceType(GQL_INTERFACE_TYPE_DOCUMENT);
	documentTypes.forEach(({
		_name: documentTypeName,
		properties
	}) => {
		const mergedglobalFieldsObj = JSON.parse(JSON.stringify(globalFieldsObj)); // deref
		//log.debug(`documentTypeName:${toStr(documentTypeName)} mergedglobalFieldsObj:${toStr(mergedglobalFieldsObj)}`);

		if (properties) {
			forceArray(properties).forEach(({
				max = 0,
				min = 0,
				name,
				valueType = VALUE_TYPE_STRING
			}) => {
				const camelizedFieldPath = name.split('.').map((k) => camelize(k, /[-]/g)).join('.');
				setIn(mergedglobalFieldsObj, camelizedFieldPath, {
					_max: max,
					_min: min,
					_valueType: valueType
				}, { merge: true });

				//const camelizedFieldKey = camelize(name, /[.-]/g);
				const camelizedFieldKey = camelizedFieldPath;
				if (camelToFieldObj[camelizedFieldKey] && camelToFieldObj[camelizedFieldKey] !== name) {
					throw new Error(`Name collision from camelized:${camelizedFieldKey} to both ${camelToFieldObj[camelizedFieldKey]} and ${name}`);
				}
				camelToFieldObj[camelizedFieldKey] = name;
			}); // properties.forEach
		}
		//log.debug(`documentTypeName:${toStr(documentTypeName)} mergedglobalFieldsObj:${toStr(mergedglobalFieldsObj)}`);

		//log.debug(`addDynamicTypes Object.keys(globalFieldsObj):${toStr(Object.keys(globalFieldsObj))}`);
		const fields = {
			...objToGraphQL({
				documentTypeName,
				glue,
				obj: mergedglobalFieldsObj
			}),
			_highlight: { type: glue.getObjectType(GQL_OBJECT_TYPE_INTERFACE_SEARCH_HIT_HIGHLIGHT) }
		};
		Object.keys(globalFieldsObj).map((k) => {
			//log.debug(`addDynamicTypes k:${toStr(k)}`);
			fields[`${k}_as_string`] = { type: GraphQLString };
		});
		const sortedFields = sortKeys(fields);
		//log.debug(`addDynamicTypes Object.keys(sortedFields):${toStr(Object.keys(sortedFields))}`);

		documentTypeObjectTypes[documentTypeName] = glue.addObjectType({
			name: documentTypeNameToGraphQLObjectTypeName(documentTypeName),
			fields: sortedFields,
			interfaces: [
				//reference(GQL_INTERFACE_TYPE_DOCUMENT) // Error: type Document not found in schema
				interfaceTypeDocument
			]
		});
	}); // documentTypes.forEach
	//log.debug(`documentTypeObjectTypes:${toStr(documentTypeObjectTypes)}`);

	//──────────────────────────────────────────────────────────────────────────

	const fieldKeysForAggregations = [];
	const fieldKeysForFilters = [];
	const highlightParameterPropertiesFields = {};
	const interfaceSearchHitsFieldsFromSchema = {};
	const staticHighlightParameterPropertiesFields = glue.getInputFields(GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTIES);

	allFieldKeys.forEach((fieldKey) => {
		const camelizedFieldKey = camelize(fieldKey, /[.-]/g);
		fieldKeysForAggregations.push(camelizedFieldKey);
		fieldKeysForFilters.push(camelizedFieldKey);
		highlightParameterPropertiesFields[camelizedFieldKey] = { type: glue.addInputType({
			name: `InputTypeHighlightProperties${ucFirst(camelizedFieldKey)}`,
			fields: staticHighlightParameterPropertiesFields
		})};
		VALUE_TYPE_VARIANTS.forEach((vT) => {
			interfaceSearchHitsFieldsFromSchema[
				`${camelizedFieldKey}_as_${vT}`
			] = { type: valueTypeToGraphQLType(vT) };
		});
	});

	addDynamicEnumTypes({
		fieldKeysForAggregations,
		fieldKeysForFilters,
		glue
	});

	addDynamicInputTypes({
		glue,
		highlightParameterPropertiesFields
	});

	// Must be after addDynamicInterfaceTypes
	addDynamicObjectTypes({
		glue,
		interfaceSearchHitsFieldsFromSchema
	});
}