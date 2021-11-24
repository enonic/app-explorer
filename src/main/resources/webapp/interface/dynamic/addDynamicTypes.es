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
	ucFirst
} from '@enonic/js-utils';
import setIn from 'set-value'; // Number.isInteger and Reflect

import {list} from '/lib/graphql';

import {
	GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTIES,
	GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_GLOBAL_FIELD
} from '../constants';
import {documentTypeNameToGraphQLObjectTypeName} from './documentTypeNameToGraphQLObjectTypeName';
import {objToGraphQL} from './objToGraphQL';
import {valueTypeToGraphQLType} from './valueTypeToGraphQLType';

import {addDynamicEnumTypes} from './addDynamicEnumTypes';
import {addDynamicInputTypes} from './addDynamicInputTypes';
import {addDynamicInterfaceTypes} from './addDynamicInterfaceTypes';
import {addDynamicObjectTypes} from './addDynamicObjectTypes';
import {addDynamicUnionTypes} from './addDynamicUnionTypes';


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
The list of objectTypes is used both in the interfaceType and unionType resolvers.
When we define the resolvers we may use a js-reference to an empty object, which later will contain the objectTypes.
When we define the unionType, we can use lib-graphql.reference, but we need to have a list of the objectType names, so we might as well use the objectTypes directly.
Q: Can we use lib-graphql.reference in objectType.interfaces?
──────────────────────────────────────────────────────────────────────────────*/

export function addDynamicTypes({
	allFieldKeys,
	camelToFieldObj,
	documentTypeObjectTypes,
	documentTypes,
	globalFieldsObj,
	glue
}) {
	addDynamicInterfaceTypes({
		documentTypeObjectTypes, // Just an empty obj, populated later
		glue,
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

		documentTypeObjectTypes[documentTypeName] = glue.addObjectType({
			name: documentTypeNameToGraphQLObjectTypeName(documentTypeName),
			fields: objToGraphQL({
				documentTypeName,
				glue,
				obj: mergedglobalFieldsObj
			}),
			interfaces: [
				//reference(GQL_INTERFACE_TYPE_DOCUMENT) // Error: type Document not found in schema
				interfaceTypeDocument
			]
		});
	}); // documentTypes.forEach
	//log.debug(`documentTypeObjectTypes:${toStr(documentTypeObjectTypes)}`);

	documentTypeObjectTypes[GQL_OBJECT_TYPE_GLOBAL_FIELD] = glue.addObjectType({
		name: GQL_OBJECT_TYPE_GLOBAL_FIELD,
		fields: objToGraphQL({
			documentTypeName: GQL_OBJECT_TYPE_GLOBAL_FIELD,
			glue,
			obj: globalFieldsObj
		})
	});

	//──────────────────────────────────────────────────────────────────────────

	const fieldKeysForAggregations = [];
	const fieldKeysForFilters = [];
	const highlightParameterPropertiesFields = {};
	const interfaceSearchHitsFieldsFromSchema = {};
	const interfaceSearchHitsHighlightsFields = {};

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
		const type = valueTypeToGraphQLType(VALUE_TYPE_STRING); // TODO There may be several valueTypes...
		interfaceSearchHitsHighlightsFields[camelizedFieldKey] = { type: list(type) };
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

	// Must be after populating documentTypeObjectTypes
	// Must be before addDynamicObjectTypes
	addDynamicUnionTypes({
		documentTypeObjectTypes, // Must be populated already, since used in types inside
		glue
	});

	addDynamicObjectTypes({ // Must be after addDynamicUnionTypes
		glue,
		interfaceSearchHitsFieldsFromSchema,
		interfaceSearchHitsHighlightsFields
	});
}
