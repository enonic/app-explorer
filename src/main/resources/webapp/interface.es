import {
	RESPONSE_TYPE_JSON,
	//VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	//VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	//VALUE_TYPE_SET,
	VALUE_TYPE_STRING,
	addQueryFilter,
	camelize,
	toStr,
	ucFirst
} from '@enonic/js-utils';
import {
	execute,
	Date as GraphQLDate,
	DateTime as GraphQLDateTime,
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	Json as GraphQLJson,
	list,
	LocalDateTime as GraphQLLocalDateTime,
	LocalTime as GraphQLLocalTime,
	newSchemaGenerator,
	nonNull/*,
	reference*/
} from '/lib/graphql';

import {getFields} from '/lib/explorer/field/getFields';
import {get as getInterface} from '/lib/explorer/interface/get';
import {filter as filterInterface} from '/lib/explorer/interface/filter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {
	COLLECTION_REPO_PREFIX,
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {removeStopWords} from '/lib/explorer/query/removeStopWords';
import {wash} from '/lib/explorer/query/wash';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';
import {get as getStopWordsList} from '/lib/explorer/stopWords/get';

const schemaGenerator = newSchemaGenerator();
//import {DEFAULT_INTERFACE_FIELDS} from '../constants';


const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ENCODER = schemaGenerator.createEnumType({
	name: 'EnumTypeHighlightOptionEncoder',
	values: [
		'default',
		'html'
	]
});

const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER = schemaGenerator.createEnumType({
	name: 'EnumTypeHighlightOptionFragmenter',
	values: [
		'simple',
		'span' // default
	]
});

const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER = schemaGenerator.createEnumType({
	name: 'EnumTypeHighlightOptionOrder',
	values: [
		'none',  // default
		'score'
	]
});

const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_TAG_SCHEMA = schemaGenerator.createEnumType({
	name: 'EnumTypeHighlightOptionTagSchema',
	values: [
		'styled'  // default is undefined
	]
});

const GRAPHQL_INPUT_TYPE_FILTER_EXISTS = schemaGenerator.createInputObjectType({
	name: 'InputTypeFilterExists',
	fields: {
		field: { type: GraphQLString }
	}
});

const GRAPHQL_INPUT_TYPE_FILTER_HAS_VALUE = schemaGenerator.createInputObjectType({
	name: 'InputTypeFilterHasValue',
	fields: {
		field: { type: GraphQLString },
		values: { type: list(GraphQLString) }
	}
});

const GRAPHQL_INPUT_TYPE_FILTER_IDS = schemaGenerator.createInputObjectType({
	name: 'InputTypeFilterIds',
	fields: {
		values: { type: list(GraphQLString) }
	}
});

const GRAPHQL_INPUT_TYPE_FILTER_NOT_EXISTS = schemaGenerator.createInputObjectType({
	name: 'InputTypeFilterNotExists',
	fields: {
		field: { type: GraphQLString }
	}
});

const GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS = {
	exists: { type: GRAPHQL_INPUT_TYPE_FILTER_EXISTS },
	hasValue: { type: GRAPHQL_INPUT_TYPE_FILTER_HAS_VALUE },
	ids: { type: GRAPHQL_INPUT_TYPE_FILTER_IDS },
	notExists: { type: GRAPHQL_INPUT_TYPE_FILTER_NOT_EXISTS }
};

const GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN = schemaGenerator.createInputObjectType({
	name: 'InputTypeFilterBoolean',
	fields: {
		must: { type: list(schemaGenerator.createInputObjectType({
			name: 'InputTypeFilterBooleanMust',
			fields: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS
		}))},
		mustNot: { type: list(schemaGenerator.createInputObjectType({
			name: 'InputTypeFilterBooleanMustNot',
			fields: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS
		}))},
		should: { type: list(schemaGenerator.createInputObjectType({
			name: 'InputTypeFilterBooleanShould',
			fields: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS
		}))}
	}
});


function washDocumentNode(node) {
	Object.keys(node).forEach((k) => {
		if (k.startsWith('_') || k.startsWith('document_metadata')) {
			delete node[k];
		}
	});
	return node;
}


function valueTypeToGraphQLType(valueType) {
	if(valueType === VALUE_TYPE_STRING) return GraphQLString; // Most values are strings
	if(valueType === 'long') return GraphQLInt; // Some are integers
	if(valueType === VALUE_TYPE_BOOLEAN) return GraphQLBoolean; // A few are boolean
	if(valueType === 'double') return GraphQLFloat; // A few are floating point numbers
	if(valueType === VALUE_TYPE_INSTANT) return GraphQLDateTime;
	if(valueType === VALUE_TYPE_LOCAL_DATE) return GraphQLDate;
	if(valueType === VALUE_TYPE_LOCAL_DATE_TIME) return GraphQLLocalDateTime;
	if(valueType === VALUE_TYPE_LOCAL_TIME) return GraphQLLocalTime;
	return GraphQLString; // The rest are string
	/*if(valueType === VALUE_TYPE_GEO_POINT) return GraphQLString; // TODO https://github.com/enonic/lib-graphql/issues/95
	//if(valueType === VALUE_TYPE_ANY) return GraphQLString;
	//if(valueType === VALUE_TYPE_SET) return GraphQLString;

	// TODO Remove in lib-explorer-4.0.0/app-explorer-2.0.0 ?
	if(valueType === 'uri') return GraphQLString;
	if(valueType === 'tag') return GraphQLString;
	if(valueType === 'html') return GraphQLString;*/
}


function generateSchemaForInterface(interfaceName) {
	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const interfaceNode = getInterface({
		connection: explorerRepoReadConnection,
		interfaceName
	});
	log.debug(`interfaceNode:${toStr(interfaceNode)}`);
	const {
		collections,
		fields,// = DEFAULT_INTERFACE_FIELDS, TODO This wont work when fields = [] which filter does
		stopWords,
		synonyms
	} = filterInterface(interfaceNode);
	//log.debug(`collections:${toStr(collections)}`);
	//log.debug(`fields:${toStr(fields)}`);
	//log.debug(`stopWords:${toStr(stopWords)}`);
	log.debug(`synonyms:${toStr(synonyms)}`);

	const fieldsRes = getFields({
		connection: explorerRepoReadConnection,
		includeSystemFields: true
	});
	//log.debug(`fieldsRes:${toStr(fieldsRes)}`);
	log.debug(`fieldsRes.hits[0]:${toStr(fieldsRes.hits[0])}`);

	const highlightParameterPropertiesFields = {};
	const interfaceSearchHitsFieldsFromSchema = {};
	const interfaceSearchHitsHighlightsFields = {};

	fieldsRes.hits.forEach(({
		fieldType: valueType = VALUE_TYPE_STRING,
		isSystemField = false,
		key/*,
		max, // TODO nonNull list
		min*/
	}) => {
		const camelizedFieldKey = camelize(key, /-/g);
		//log.debug(`key:${toStr(key)} camelized:${toStr(camelizedFieldKey)}`);
		if (!isSystemField) {
			highlightParameterPropertiesFields[camelizedFieldKey] = { type: schemaGenerator.createInputObjectType({
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
			const type = valueTypeToGraphQLType(valueType);
			interfaceSearchHitsFieldsFromSchema[camelizedFieldKey] = { type };
			interfaceSearchHitsHighlightsFields[camelizedFieldKey] = { type: list(type) };
		}
	});
	//log.debug(`highlightParameterPropertiesFields:${toStr(highlightParameterPropertiesFields)}`);

	const interfaceSearchHitsFields = {
		_highlight: { type: schemaGenerator.createObjectType({
			name: 'InterfaceSearchHitsHighlights',
			fields: interfaceSearchHitsHighlightsFields // This list can't be empty when createObjectType is called?
		})},
		_json: { type: GraphQLJson },
		_score: { type: GraphQLFloat }
	};
	Object.keys(interfaceSearchHitsFieldsFromSchema).forEach((k) => {
		interfaceSearchHitsFields[k] = interfaceSearchHitsFieldsFromSchema[k];
	});

	const highlightProperties = schemaGenerator.createInputObjectType({
		name: 'HighlightParameterProperties',
		fields: highlightParameterPropertiesFields
	});

	return schemaGenerator.createSchema({
		//dictionary:,
		//mutation:,
		query: schemaGenerator.createObjectType({
			name: 'Query',
			fields: {
				search: {
					args: {
						filters: schemaGenerator.createInputObjectType({
							name: 'FiltersParameter',
							fields: {
								boolean: { type: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN },
								exists: { type: GRAPHQL_INPUT_TYPE_FILTER_EXISTS },
								hasValue: { type: GRAPHQL_INPUT_TYPE_FILTER_HAS_VALUE },
								ids: { type: GRAPHQL_INPUT_TYPE_FILTER_IDS },
								notExists: { type: GRAPHQL_INPUT_TYPE_FILTER_NOT_EXISTS }
							}
						}),
						highlight: schemaGenerator.createInputObjectType({
							name: 'HighlightParameter',
							fields: {
								encoder: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ENCODER }, // Global only
								fragmenter: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER },
								fragmentSize: { type: GraphQLInt },
								noMatchSize: { type: GraphQLInt },
								numberOfFragments: { type: GraphQLInt },
								order: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER },
								postTag: { type: GraphQLString },
								preTag: { type: GraphQLString },
								requireFieldMatch: { type: GraphQLBoolean },
								tagsSchema: { type: GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_TAG_SCHEMA }, // Global only
								properties: { type: highlightProperties }
							}
						}),
						searchString: GraphQLString
					},
					resolve: (env) => {
						const {
							args: {
								filters = {},
								highlight = {
									//encoder: 'html' // html value will force escaping html, if you use html highlighting tags
									//fragmenter: 'span', // simple
									//fragmentSize: 100,
									//noMatchSize: 0,
									//numberOfFragments: 5,
									//order: 'none', // score
									//postTag: '</em>',
									//preTag: '<em>',
									//requireFieldMatch: true,
									//tagsSchema: 'styled'
								},
								searchString = ''
							}
						} = env;
						//log.debug(`filters:${toStr(filters)}`);
						//log.debug(`highlight:${toStr(highlight)}`);

						//log.debug(`searchString:${toStr(searchString)}`);
						const washedSearchString = wash({string: searchString});
						//log.debug(`washedSearchString:${toStr({washedSearchString})}`);

						// TODO stopWords could be cached:
						const listOfStopWords = [];
						if (stopWords && stopWords.length) {
							stopWords.forEach((name) => {
								const {words} = getStopWordsList({ // Not a query
									connection: explorerRepoReadConnection,
									name
								});
								//log.debug(toStr({words}));
								words.forEach((word) => {
									if (!listOfStopWords.includes(word)) {
										listOfStopWords.push(word);
									}
								});
							});
						}
						//log.debug(`listOfStopWords:${toStr({listOfStopWords})}`);

						const removedStopWords = [];
						const searchStringWithoutStopWords = removeStopWords({
							removedStopWords,
							stopWords: listOfStopWords,
							string: washedSearchString
						});
						//log.debug(`searchStringWithoutStopWords:${toStr({searchStringWithoutStopWords})}`);
						//log.debug(`removedStopWords:${toStr({removedStopWords})}`);

						const queryParams = {
							count: 1, // TODO DEBUG Use "GraphQL iterator instead..."
							filters: addQueryFilter({
								filter: hasValue('_nodeType', [NT_DOCUMENT]),
								filters
							}),
							highlight,
							query: `fulltext('${fields.map(({name: field, boost = 1}) => `${field}${boost && boost > 1 ? `^${boost}` : ''}`)}', '${searchStringWithoutStopWords}', 'AND')`
						};
						log.debug(`queryParams:${toStr({queryParams})}`);

						const multiConnectParams = {
							principals: [PRINCIPAL_EXPLORER_READ],
							sources: collections.map(collection => ({
								repoId: `${COLLECTION_REPO_PREFIX}${collection}`,
								branch: 'master', // NOTE Hardcoded
								principals: [PRINCIPAL_EXPLORER_READ]
							}))
						};
						//log.debug(`multiConnectParams:${toStr({multiConnectParams})}`);

						const multiRepoReadConnection = multiConnect(multiConnectParams);

						const queryRes = multiRepoReadConnection.query(queryParams);
						//log.debug(`queryRes:${toStr({queryRes})}`);

						queryRes.hits = queryRes.hits.map(({
							branch,
							highlight,
							id,
							repoId,
							score
						}) => {
							const washedNode = washDocumentNode(connect({
								branch,
								principals: [PRINCIPAL_EXPLORER_READ],
								repoId
							}).get(id));
							const json = JSON.stringify(washedNode);
							/* eslint-disable no-underscore-dangle */
							washedNode._highlight = highlight;
							washedNode._json = json;
							washedNode._score = score;
							/* eslint-enable no-underscore-dangle */
							return washedNode;
						});
						log.debug(`queryRes:${toStr({queryRes})}`);

						return queryRes;
					},
					type: schemaGenerator.createObjectType({
						name: 'InterfaceSearch',
						fields: {
							total: { type: nonNull(GraphQLInt) },
							count: { type: nonNull(GraphQLInt) },
							hits: { type: list(schemaGenerator.createObjectType({
								name: 'InterfaceSearchHits',
								fields: interfaceSearchHitsFields
							})) }
						}
					})
				}
			}
		})
		//subscription:
	});
}


export function post(request) {
	//log.debug(`request:${toStr(request)}`);
	const {
		body: bodyJson = '{}',
		headers: {
			'Authorization': authorization // 'Explorer-Api-Key XXXX'
		},
		pathParams: {
			interfaceName// = 'default'
		} = {}
	} = request;
	log.debug(`authorization:${toStr(authorization)}`);
	// TODO get apiKey from authorization header...
	//log.debug(`interfaceName:${toStr(interfaceName)}`);
	const body = JSON.parse(bodyJson);
	const {query, variables} = body;
	log.debug(`query:${toStr(query)}`);
	log.debug(`variables:${toStr(variables)}`);
	const context = {};
	log.debug(`context:${toStr(context)}`);
	return {
		contentType: RESPONSE_TYPE_JSON,
		body: execute(generateSchemaForInterface(interfaceName), query, variables, context)
	};
}

/*
{
	search(
    filters: {
      #boolean: {
        #must: {
          #exists: {
          # 	field: "title"
          #}
          #hasValue: {
          #  field: "title"
          #  values: "Example Domain"
          #}
          #ids: {
          #  values: "530e980b-89dc-4522-af0f-df4b420a1f81"
          #}
          #notExists: {
          #  field: "title"
          #}
        #} #must
        #mustNot: {
          #exists: {
          # 	field: "title"
          #}
          #hasValue: {
          #  field: "title"
          #  values: "Example Domain"
          #}
          #ids: {
          #  values: "530e980b-89dc-4522-af0f-df4b420a1f81"
          #}
          #notExists: {
          #  field: "nonExistant"
          #}
        #} # mustNot
        #should: [{
        #  exists: {
        #   	field: "title"
        #  }
        #},{
        #  exists: {
        #   	field: "text"
        #	}
        #}] # should
      #} # boolean
      #exists: {
      #    field: "title"
      #    field: "nonExistant"
      #}
      #hasValue: {
      #    field: "title"
      #    values: "Example Domain"
      #    values: "nonExistant"
      #}
      #ids: {
          #values: "530e980b-89dc-4522-af0f-df4b420a1f81"
      		#values: "nonExistant"
      #}
      #notExists: {
      #  field: "title"
      #}
    }
    highlight: {
      #encoder: html
      fragmenter: simple
      fragmentSize: 255
      noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
      numberOfFragments: 1
      #order: none
      postTag: "</b>"
      preTag: "<b>"
      requireFieldMatch: false
      #tagsSchema: styled
      properties: {
        title: {
          #fragmenter: simple
          #noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
          #numberOfFragments: 1
          #order: none
          #requireFieldMatch: false
        }
        text: {
          fragmenter: span
      		fragmentSize: 50
      		#noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
      		numberOfFragments: 2
      		order: score
      		#postTag: "</b>"
      		#preTag: "<b>"
      		#requireFieldMatch: false
        }
        uri: {
          #fragmenter: simple
          #noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
          #numberOfFragments: 1
          #order: none
          #requireFieldMatch: false
        }
      }
    }
    searchString: "domain"
  ) {
    count
    total
    hits {
      _highlight {
        title
        text
        uri
      }
      _json
      _score
      title
      text
      uri
    }
  }
}
*/
