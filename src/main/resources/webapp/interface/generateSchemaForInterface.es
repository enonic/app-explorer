import {
	//VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	//VALUE_TYPE_SET,
	VALUE_TYPE_STRING,
	camelize,
	forceArray,
	isSet,
	ucFirst
} from '@enonic/js-utils';
import 'reflect-metadata';
import setIn from 'set-value'; // Number.isInteger and Reflect

import {getFields} from '/lib/explorer/field/getFields';
import {get as getInterface} from '/lib/explorer/interface/get';
import {filter as filterInterface} from '/lib/explorer/interface/filter';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator
} from '/lib/graphql';

import {
	GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS,
	GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS,
	GQL_ENUM_HIGHLIGHT_OPTION_ORDERS,
	GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS,
	GQL_INTERFACE_TYPE_DOCUMENT,
	GQL_OBJECT_TYPE_GLOBAL_FIELD,
	VALUE_TYPE_JSON
} from './constants';

import {constructGlue} from './Glue';

import {addStaticEnumTypes} from './addStaticEnumTypes';
import {addStaticInputTypes} from './addStaticInputTypes';
import {addStaticObjectTypes} from './addStaticObjectTypes';
import {addStaticUnionTypes} from './addStaticUnionTypes';

import {documentTypeNameToGraphQLObjectTypeName} from './documentTypeNameToGraphQLObjectTypeName';
import {objToGraphQL} from './objToGraphQL';
import {valueTypeToGraphQLType} from './valueTypeToGraphQLType';

import {addDynamicEnumTypes} from './addDynamicEnumTypes';
import {addDynamicInputTypes} from './addDynamicInputTypes';
import {addDynamicInterfaceTypes} from './addDynamicInterfaceTypes';
import {addDynamicObjectTypes} from './addDynamicObjectTypes';
import {addDynamicUnionTypes} from './addDynamicUnionTypes';
import {buildSchema} from './buildSchema';

const schemaGenerator = newSchemaGenerator();
//import {DEFAULT_INTERFACE_FIELDS} from '../constants';

const VALUE_TYPE_VARIANTS = [
	//VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_REFERENCE,
	//VALUE_TYPE_SET,
	VALUE_TYPE_STRING
];


export function generateSchemaForInterface(interfaceName) {
	const glue = constructGlue({schemaGenerator});

	addStaticEnumTypes(glue);
	addStaticInputTypes(glue);

	const staticHighlightParameterPropertiesFields = {
		fragmenter: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_FRAGMENTERS) },
		fragmentSize: { type: GraphQLInt },
		noMatchSize: { type: GraphQLInt },
		numberOfFragments: { type: GraphQLInt },
		order: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_ORDERS) },
		postTag: { type: GraphQLString },
		preTag: { type: GraphQLString },
		requireFieldMatch: { type: GraphQLBoolean }
	};

	const staticHighlightParameterFields = {
		encoder: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_ENCODERS) }, // Global only
		...staticHighlightParameterPropertiesFields,
		tagsSchema: { type: glue.getEnumType(GQL_ENUM_HIGHLIGHT_OPTION_TAG_SCHEMAS) } // Global only
	};

	addStaticObjectTypes(glue); // Must be before addStaticUnionTypes()
	addStaticUnionTypes(glue); // Must be after addStaticObjectTypes()

	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

	//──────────────────────────────────────────────────────────────────────────
	// In order to make a documentTypesUnion supporting GraphQL inline fragments (... on documentType)
	// I have to make one objectType per documentType and it needs a unqiue name
	// It needs all global fields, and all documentType local fields
	//──────────────────────────────────────────────────────────────────────────
	// 1. Get all global fields, and make a spreadable fields object to reuse and override per docmentType
	//──────────────────────────────────────────────────────────────────────────
	const fieldsRes = getFields({ // Note these are sorted 'key ASC'
		connection: explorerRepoReadConnection,
		includeSystemFields: true
	});
	//log.debug(`fieldsRes:${toStr(fieldsRes)}`);
	//log.debug(`fieldsRes.hits[0]:${toStr(fieldsRes.hits[0])}`);

	/*────────────────────────────────────────────────────────────────────────────
	This document:
		{
			person: {
				age: 30,
				name: 'John'
			}
		}

	Should be covered by this documentType:
		fields: [
			//{ key: 'person', valueType: 'Set' } // This entry is optional
			{ key: 'person.age', valueType: 'Long' }
			{ key: 'person.name', valueType: 'String' }
		]

	Should end up like this GraphQL schema:
		fields: {
			person: {
				type: ObjectType({
					name: 'Person',
					fields: {
						age: { type: GraphQLInt },
						name: { type: GraphQLString }
					}
				})
			}
		}

	Using setIn I can make this intermediary:
		{
			person: {
				_valueType: 'Set',
				age: {
					_valueType: 'Long',
				},
				name: {
					_valueType: 'String',
				}
			}
		}
	And then use traverse to build the GraphQL schema?
	────────────────────────────────────────────────────────────────────────────*/
	const camelToFieldObj = {};
	const nestedFieldsObj = { // NOTE Hardcoded common fields, which are not currently system fields
		_collectionId: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_REFERENCE
		},
		_collectionName: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		},
		_documentTypeId: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_REFERENCE
		},
		_documentTypeName: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_STRING
		},
		_json: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_JSON
		},
		//_highlight, // TODO ???
		_repoId: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_REFERENCE
		},
		_score: {
			_max: 1,
			_min: 1,
			_valueType: VALUE_TYPE_DOUBLE
		}
	};
	fieldsRes.hits.forEach(({ // TODO traverse
		fieldType: valueType,
		inResults,
		//isSystemField = false,
		key,
		max = 0,
		min = 0
	}) => {
		const camelizedFieldPath = key.split('.').map((k) => camelize(k, /[-]/g)).join('.');
		//log.debug(`inResults:${toStr(inResults)} key:${toStr(key)} camelizedFieldPath:${toStr(camelizedFieldPath)}`);

		if (inResults !== false) {
			setIn(nestedFieldsObj, camelizedFieldPath, {
				//_isSystemField: isSystemField,
				_max: max,
				_min: min,
				_valueType: valueType
			}, { merge: true });
		}
	});
	//log.debug(`nestedFieldsObj:${toStr(nestedFieldsObj)}`);

	//──────────────────────────────────────────────────────────────────────────
	// 2. Get all documentTypes mentioned in the interface collections
	//──────────────────────────────────────────────────────────────────────────
	const interfaceNode = getInterface({
		connection: explorerRepoReadConnection,
		interfaceName
	});
	//log.debug(`interfaceNode:${toStr(interfaceNode)}`);

	const {
		collectionIds,
		fields = [],// = DEFAULT_INTERFACE_FIELDS, TODO This wont work when fields = [] which filter does
		stopWords//,
		//synonyms // TODO
	} = filterInterface(interfaceNode);
	//log.debug(`fields:${toStr(fields)}`);
	//log.debug(`stopWords:${toStr(stopWords)}`);
	//log.debug(`synonyms:${toStr(synonyms)}`);

	//log.debug(`collectionIds:${toStr(collectionIds)}`);

	const collections = explorerRepoReadConnection.get(collectionIds);
	//log.debug(`collections:${toStr(collections)}`);

	const collectionIdToDocumentTypeId = {};
	const documentTypeIds = collections.map(({
		_id: collectionId,
		documentTypeId
	}) => {
		if (isSet(documentTypeId)) {
			collectionIdToDocumentTypeId[collectionId] = documentTypeId;
		}
		return documentTypeId;
	})
		.filter((v, i, a) => isSet(v) && a.indexOf(v) === i);
	//log.debug(`documentTypeIds:${toStr(documentTypeIds)}`);

	const documentTypes = explorerRepoReadConnection.get(documentTypeIds);
	//log.debug(`documentTypes:${toStr(documentTypes)}`);

	//──────────────────────────────────────────────────────────────────────────
	// 3. Make one objectType per documentType
	//
	// Global fields can be overridden, let's think about some scenarios:
	//
	// Scenario A:
	//  * Global field person is a Set, with two sub fields name and age
	//  * Local field person is a String
	//  Merged documentType should have person as a String. An no mention of name and age.
	//
	// Scenario B:
	//  * Global field person is a String
	//  * Local field person is a Set with subfields name and age
	//  Merged documentType should have person as a Set with subfields name and age.
	//
	//──────────────────────────────────────────────────────────────────────────

	const documentTypeObjectTypes = {}; // Defined before addDynamicInterfaceTypes, populated after

	//──────────────────────────────────────────────────────────────────────────
	// An objectType per documentType will be generated.
	// Global and "magic" fields will be added to an interfaceType.
	// The list of objectTypes is used both in the interfaceType and unionType resolvers.
	// When we define the resolvers we may use a js-reference to an empty object, which later will contain the objectTypes.
	// When we define the unionType, we can use lib-graphql.reference, but we need to have a list of the objectType names, so we might as well use the objectTypes directly.
	// Q: Can we use lib-graphql.reference in objectType.interfaces?
	//──────────────────────────────────────────────────────────────────────────

	addDynamicInterfaceTypes({
		documentTypeObjectTypes, // Just an empty obj, populated later
		glue,
		nestedFieldsObj
	});

	const interfaceTypeDocument = glue.getInterfaceType(GQL_INTERFACE_TYPE_DOCUMENT);
	documentTypes.forEach(({
		_name: documentTypeName,
		properties
	}) => {
		const mergedNestedFieldsObj = JSON.parse(JSON.stringify(nestedFieldsObj)); // deref
		//log.debug(`documentTypeName:${toStr(documentTypeName)} mergedNestedFieldsObj:${toStr(mergedNestedFieldsObj)}`);

		if (properties) {
			forceArray(properties).forEach(({
				max = 0,
				min = 0,
				name,
				valueType = VALUE_TYPE_STRING
			}) => {
				const camelizedFieldPath = name.split('.').map((k) => camelize(k, /[-]/g)).join('.');
				setIn(mergedNestedFieldsObj, camelizedFieldPath, {
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
		//log.debug(`documentTypeName:${toStr(documentTypeName)} mergedNestedFieldsObj:${toStr(mergedNestedFieldsObj)}`);

		documentTypeObjectTypes[documentTypeName] = glue.addObjectType({
			name: documentTypeNameToGraphQLObjectTypeName(documentTypeName),
			fields: objToGraphQL({
				documentTypeName,
				glue,
				obj: mergedNestedFieldsObj
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
			obj: nestedFieldsObj
		})
	});

	//──────────────────────────────────────────────────────────────────────────

	const allFieldKeys = [];

	const documentTypeIdToName = {};
	documentTypes.forEach(({
		_id: documentTypeId,
		_name: documentTypeName,
		properties
	}) => {
		documentTypeIdToName[documentTypeId] = documentTypeName;
		if (properties) {
			forceArray(properties).forEach(({name}) => {
				if (!allFieldKeys.includes(name)) {
					allFieldKeys.push(name);
				}
			});
		}
	});
	//log.debug(`allFieldKeys:${toStr(allFieldKeys)}`);

	fieldsRes.hits.forEach(({key}) => {
		if (!allFieldKeys.includes(key)) {
			allFieldKeys.push(key);
		}
	});
	allFieldKeys.sort();
	//log.debug(`allFieldKeys:${toStr(allFieldKeys)}`);

	const fieldKeysForAggregations = [];
	const fieldKeysForFilters = [];
	const highlightParameterPropertiesFields = {};
	const interfaceSearchHitsFieldsFromSchema = {};
	const interfaceSearchHitsHighlightsFields = {};

	allFieldKeys.forEach((fieldKey) => {
		const camelizedFieldKey = camelize(fieldKey, /[.-]/g);
		fieldKeysForAggregations.push(camelizedFieldKey);
		fieldKeysForFilters.push(camelizedFieldKey);
		highlightParameterPropertiesFields[camelizedFieldKey] = { type: glue.addInputType({
			name: `HighlightParameterProperties${ucFirst(camelizedFieldKey)}`,
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

	//log.debug(`fieldsRes.hits:${toStr(fieldsRes.hits)}`);
	/*fieldsRes.hits.forEach(({
		fieldType: valueType,
		inResults,
		//isSystemField = false,
		key/*,
		max, // TODO nonNull list
		min
	}) => {
		if (valueType) {
			const camelizedFieldKey = camelize(key, /[.-]/g);
			camelToFieldObj[camelizedFieldKey] = key;
			//log.debug(`key:${toStr(key)} camelized:${toStr(camelizedFieldKey)}`);
			/*if (![VALUE_TYPE_ANY, VALUE_TYPE_SET].includes(valueType)) {
				//fieldKeysForAggregations.push(camelizedFieldKey);
				//fieldKeysForFilters.push(camelizedFieldKey);
			}
			//log.debug(`key:${toStr(key)} camelized:${toStr(camelizedFieldKey)} inResults:${toStr(inResults)}`);
			if (inResults !== false) {
				/*highlightParameterPropertiesFields[camelizedFieldKey] = { type: glue.addInputType({
					name: `HighlightParameterProperties${ucFirst(camelizedFieldKey)}`,
					fields: {
						fragmenter: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER },
						fragmentSize: { type: GraphQLInt },
						noMatchSize: { type: GraphQLInt },
						numberOfFragments: { type: GraphQLInt },
						order: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER },
						postTag: { type: GraphQLString },
						preTag: { type: GraphQLString },
						requireFieldMatch: { type: GraphQLBoolean }
					}
				})};

				//interfaceSearchHitsFieldsFromSchema[camelizedFieldKey] = { type };
				/*VALUE_TYPE_VARIANTS.forEach((vT) => {
					interfaceSearchHitsFieldsFromSchema[
						`${camelizedFieldKey}_as_${vT}`
					] = { type: valueTypeToGraphQLType(vT) };
				});

				const type = valueTypeToGraphQLType(valueType);
				interfaceSearchHitsHighlightsFields[camelizedFieldKey] = { type: list(type) };
			}
		}
	}); // fields.forEach*/
	//log.debug(`camelToFieldObj:${toStr(camelToFieldObj)}`);

	// Name must be non-null, non-empty and match [_A-Za-z][_0-9A-Za-z]* - was 'GraphQLScalarType{name='String', description='Built-in String', coercing=graphql.Scalars$3@af372a4}'
	//enumFieldsValues.push(GraphQLString);

	//log.debug(`enumFieldsValues:${toStr(enumFieldsValues)}`);
	//log.debug(`highlightParameterPropertiesFields:${toStr(highlightParameterPropertiesFields)}`);

	addDynamicEnumTypes({
		fieldKeysForAggregations,
		fieldKeysForFilters,
		glue
	});

	addDynamicInputTypes({
		glue,
		highlightParameterPropertiesFields,
		staticHighlightParameterFields
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

	return buildSchema({
		camelToFieldObj,
		collections,
		collectionIdToDocumentTypeId,
		glue,
		documentTypeIdToName,
		fields,
		stopWords
	});
}

/* Example query:
{
  search(
    aggregations: {
      name: "a"
      #count:
      terms: {
        field: language
        size: 10
        minDocCount: 1
      }
    }
    count: 1
    filters: {
      exists: {
        field: location
      }
    }
    highlight: {
      #encoder: default
      #fragmenter: simple
      fragmentSize: 255
      #noMatchSize: 0
      #numberOfFragments: 1
      order: none
      postTag: "</b>"
      preTag: "<b>"
      #requireFieldMatch: true
      #tagsSchema: styled
      properties: {
        text: {}
      	title: {}
        uri: {}
      }
    }
    searchString: "whatever"
    start: 0
  ) {
    #aggregations {
    	#__typename
      #... on AggregationTerms {
        #name
        #buckets {
          #key
          #docCount
        #}
      #}
		#}
    #aggregationsAsJson
    #count
    #total
    hits {
      #_collectionId
      #_collectionName
      #_documentTypeId
      #_documentTypeName
      #_highlight {
        #text
        #title
        #uri
      #}
      #_json
      #_repoId
      #_score
      #informationType
      #source
      #text
      #title
      #uri
    }
  }
}
*/
