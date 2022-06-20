import type {DocumentTypeNode} from '/lib/explorer/types/DocumentType.d';
import type {CamelToFieldObj} from '../../types.d';
import type {Glue} from '../../utils/Glue';
import type {GlobalFieldsObj} from '../buildGlobalFieldsObj';


import {
	HIGHLIGHT_FIELD_ALLTEXT,
	/*VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	VALUE_TYPE_STRING,*/
	camelize,
	//toStr,
	ucFirst
} from '@enonic/js-utils';

import {GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTIES} from '../constants';
//import {valueTypeToGraphQLType} from './valueTypeToGraphQLType';

import {addDocumentTypeObjectTypes} from './addDocumentTypeObjectTypes';
import {addDynamicEnumTypes} from './addDynamicEnumTypes';
import {addDynamicInputTypes} from './addDynamicInputTypes';
import {addDynamicInterfaceTypes} from './addDynamicInterfaceTypes';
import {addDynamicObjectTypes} from './addDynamicObjectTypes';


/*const VALUE_TYPE_VARIANTS = [
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
];*/

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
} :{
	allFieldKeys :Array<string>
	camelToFieldObj :CamelToFieldObj
	documentTypes :Array<DocumentTypeNode>
	globalFieldsObj :GlobalFieldsObj
	glue :Glue
	interfaceSearchHitsHighlightsFields :{
		[k :string] :any
	}
}) {
	const documentTypeObjectTypes = {}; // Defined before addDynamicInterfaceTypes, populated after

	// Must be before addDynamicObjectTypes
	addDynamicInterfaceTypes({
		documentTypeObjectTypes, // Just an empty obj, populated later
		glue,
		interfaceSearchHitsHighlightsFields//,
		//globalFieldsObj
	});

	//──────────────────────────────────────────────────────────────────────────

	const fieldKeysForAggregations = [];
	const fieldKeysForFilters = [];
	const staticHighlightParameterPropertiesFields = glue.getInputFields(GQL_INPUT_FIELDS_HIGHLIGHT_PROPERTIES);
	const highlightParameterPropertiesFields = {
		[HIGHLIGHT_FIELD_ALLTEXT]: {
			type: glue.addInputType({
				name: `InputTypeHighlightProperties${ucFirst(HIGHLIGHT_FIELD_ALLTEXT)}`,
				fields: staticHighlightParameterPropertiesFields
			})
		}
	};
	//const interfaceSearchHitsFieldsFromSchema = {};

	allFieldKeys.forEach((fieldKey) => {
		const camelizedFieldKey = camelize(fieldKey, /[.-]/g);
		fieldKeysForAggregations.push(camelizedFieldKey);
		fieldKeysForFilters.push(camelizedFieldKey);
		highlightParameterPropertiesFields[camelizedFieldKey] = { type: glue.addInputType({
			name: `InputTypeHighlightProperties${ucFirst(camelizedFieldKey)}`,
			fields: staticHighlightParameterPropertiesFields
		})};
		/*VALUE_TYPE_VARIANTS.forEach((vT) => {
			interfaceSearchHitsFieldsFromSchema[
				`${camelizedFieldKey}_as_${vT}`
			] = { type: valueTypeToGraphQLType(vT) };
		});*/
	});

	//──────────────────────────────────────────────────────────────────────────

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
	addDocumentTypeObjectTypes({
		camelToFieldObj, // modified within
		documentTypeObjectTypes, // modified within
		documentTypes,
		globalFieldsObj,
		glue
	});

	// Must be after addDynamicInterfaceTypes
	addDynamicObjectTypes({
		glue//,
		//interfaceSearchHitsFieldsFromSchema
	});
}
