import 'reflect-metadata'; // Must be imported only once per WebPack Bundle (Required by setIn)

import {getFields} from '/lib/explorer/field/getFields';

import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {newSchemaGenerator} from '/lib/graphql';

import {addDynamicTypes} from './dynamic/addDynamicTypes';
import {addStaticTypes} from './static/addStaticTypes';
import {buildGlobalFieldsObj} from './buildGlobalFieldsObj';
import {buildSchema} from './buildSchema';
import {constructGlue} from './Glue';
import {getInterfaceInfo} from './getInterfaceInfo';


const schemaGenerator = newSchemaGenerator();
//import {DEFAULT_INTERFACE_FIELDS} from '../constants';

/*──────────────────────────────────────────────────────────────────────────────
In order to make a documentTypesUnion supporting GraphQL inline fragments (... on documentType)
I have to make one objectType per documentType and it needs a unqiue name
It needs all global fields, and all documentType local fields
────────────────────────────────────────────────────────────────────────────────
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
────────────────────────────────────────────────────────────────────────────────
Global fields can be overridden, let's think about some scenarios:

Scenario A:
 * Global field person is a Set, with two sub fields name and age
 * Local field person is a String
 Merged documentType should have person as a String. An no mention of name and age.

Scenario B:
 * Global field person is a String
 * Local field person is a Set with subfields name and age
 Merged documentType should have person as a Set with subfields name and age.
────────────────────────────────────────────────────────────────────────────*/

export function generateSchemaForInterface(interfaceName) {
	const glue = constructGlue({schemaGenerator});
	addStaticTypes(glue);

	//──────────────────────────────────────────────────────────────────────────
	// 1. Get all global fields, and make a spreadable fields object to reuse and override per documentType
	//──────────────────────────────────────────────────────────────────────────
	const fieldsRes = getFields({ // Note these are sorted 'key ASC'
		connection: connect({ principals: [PRINCIPAL_EXPLORER_READ] }),
		includeSystemFields: true
	});
	//log.debug(`fieldsRes:${toStr(fieldsRes)}`);
	//log.debug(`fieldsRes.hits[0]:${toStr(fieldsRes.hits[0])}`);

	const camelToFieldObj = {};
	const globalFieldsObj = buildGlobalFieldsObj({fieldsRes});

	//──────────────────────────────────────────────────────────────────────────
	// 2. Get all documentTypes mentioned in the interface collections
	//──────────────────────────────────────────────────────────────────────────
	const {
		allFieldKeys,
		collections,
		collectionIdToDocumentTypeId,
		documentTypeIdToName,
		documentTypes,
		fields,
		stopWords
	} = getInterfaceInfo({
		fieldsRes,
		interfaceName
	});

	//──────────────────────────────────────────────────────────────────────────
	// 3. Make one objectType per documentType
	//──────────────────────────────────────────────────────────────────────────
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

	addDynamicTypes({
		allFieldKeys,
		camelToFieldObj,
		documentTypes,
		globalFieldsObj,
		glue
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
