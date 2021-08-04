import {
	RESPONSE_TYPE_JSON,
	VALUE_TYPE_ANY,
	VALUE_TYPE_BOOLEAN,
	//VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_SET,
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
	nonNull,
	reference
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

const {
	createEnumType,
	createInputObjectType,
	createObjectType,
	createSchema/*,
	createUnionType*/
} = newSchemaGenerator();
//import {DEFAULT_INTERFACE_FIELDS} from '../constants';


const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ENCODER = createEnumType({
	name: 'EnumTypeHighlightOptionEncoder',
	values: [
		'default',
		'html'
	]
});

const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER = createEnumType({
	name: 'EnumTypeHighlightOptionFragmenter',
	values: [
		'simple',
		'span' // default
	]
});

const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER = createEnumType({
	name: 'EnumTypeHighlightOptionOrder',
	values: [
		'none',  // default
		'score'
	]
});

const GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_TAG_SCHEMA = createEnumType({
	name: 'EnumTypeHighlightOptionTagSchema',
	values: [
		'styled'  // default is undefined
	]
});

/*const GRAPHQL_INPUT_TYPE_FILTER_EXISTS = createInputObjectType({
	name: 'InputTypeFilterExists',
	fields: {
		field: { type: nonNull(GraphQLString) }
	}
});

const GRAPHQL_INPUT_TYPE_FILTER_HAS_VALUE = createInputObjectType({
	name: 'InputTypeFilterHasValue',
	fields: {
		field: { type: nonNull(GraphQLString) },
		values: { type: nonNull(list(GraphQLString)) }
	}
});*/

/*const GRAPHQL_INPUT_TYPE_AGGREGATION_STATS = createInputObjectType({
	name: 'InputTypeAggregationStats',
	fields: {
		field: {
			type: nonNull(GraphQLString)
		}
	}
});*/

const GRAPHQL_INPUT_TYPE_AGGREGATION_TERMS = createInputObjectType({
	name: 'InputTypeAggregationTerms',
	fields: {
		field: {
			type: nonNull(GraphQLString)
		},
		order: {
			type: GraphQLString
		},
		size: {
			type: GraphQLInt
		},
		minDocCount: {
			type: GraphQLInt
		}
	}
});

// TODO: range, dateRange, dateHistogram, geoDistance, min, max and valueCount
// https://github.com/enonic/lib-guillotine/blob/master/src/main/resources/lib/guillotine/generic/input-types.js

const GRAPHQL_INPUT_TYPE_FILTER_IDS = createInputObjectType({
	name: 'InputTypeFilterIds',
	fields: {
		values: { type: nonNull(list(GraphQLString)) }
	}
});

/*const GRAPHQL_INPUT_TYPE_FILTER_NOT_EXISTS = createInputObjectType({
	name: 'InputTypeFilterNotExists',
	fields: {
		field: { type: nonNull(GraphQLString) }
	}
});

const GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS = {
	exists: { type: GRAPHQL_INPUT_TYPE_FILTER_EXISTS },
	hasValue: { type: GRAPHQL_INPUT_TYPE_FILTER_HAS_VALUE },
	ids: { type: GRAPHQL_INPUT_TYPE_FILTER_IDS },
	notExists: { type: GRAPHQL_INPUT_TYPE_FILTER_NOT_EXISTS }
};

const GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN = createInputObjectType({
	name: 'InputTypeFilterBoolean',
	fields: {
		must: { type: list(createInputObjectType({
			name: 'InputTypeFilterBooleanMust',
			fields: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS
		}))},
		mustNot: { type: list(createInputObjectType({
			name: 'InputTypeFilterBooleanMustNot',
			fields: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS
		}))},
		should: { type: list(createInputObjectType({
			name: 'InputTypeFilterBooleanShould',
			fields: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS
		}))}
	}
});*/


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
	//log.debug(`interfaceNode:${toStr(interfaceNode)}`);
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
	//log.debug(`fieldsRes.hits[0]:${toStr(fieldsRes.hits[0])}`);

	const enumTypeFilterFieldsValues = [];
	const highlightParameterPropertiesFields = {};
	const interfaceSearchHitsFieldsFromSchema = {};
	const interfaceSearchHitsHighlightsFields = {};

	fieldsRes.hits.forEach(({
		fieldType: valueType,
		isSystemField = false,
		key/*,
		max, // TODO nonNull list
		min*/
	}) => {
		if (valueType) {
			const camelizedFieldKey = camelize(key, /[.-]/g);
			//log.debug(`key:${toStr(key)} camelized:${toStr(camelizedFieldKey)}`);
			if (![VALUE_TYPE_ANY, VALUE_TYPE_SET].includes(valueType)) {
				enumTypeFilterFieldsValues.push(camelizedFieldKey);
			}
			if (!isSystemField) {
				highlightParameterPropertiesFields[camelizedFieldKey] = { type: createInputObjectType({
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
		}
	});

	// Name must be non-null, non-empty and match [_A-Za-z][_0-9A-Za-z]* - was 'GraphQLScalarType{name='String', description='Built-in String', coercing=graphql.Scalars$3@af372a4}'
	//enumTypeFilterFieldsValues.push(GraphQLString);

	//log.debug(`enumTypeFilterFieldsValues:${toStr(enumTypeFilterFieldsValues)}`);
	//log.debug(`highlightParameterPropertiesFields:${toStr(highlightParameterPropertiesFields)}`);

	const enumTypeFilterFields = createEnumType({
		name: 'EnumTypeFilterFields',
		values: enumTypeFilterFieldsValues
	});

	/* Can't union enum and scalar, only object...
	const unionTypeFilterExistsWithDynamicFieldsField = createUnionType({
		name: 'UnionTypeFilterExistsWithDynamicFieldsField',
		types: [
			nonNull(enumTypeFilterFields),
			nonNull(GraphQLString)
		],
		typeResolver: (a,b) => {
			log.debug(`a:${toStr(a)}`);
			log.debug(`b:${toStr(b)}`);
			return GraphQLString;
		}
	});*/

	const graphqlInputTypeFilterExistsWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterExistsWithDynamicFields',
		fields: {
			field: {
				type: nonNull(enumTypeFilterFields)/*,
				//type: unionTypeFilterExistsWithDynamicFieldsField
				resolver: (env) => {
					log.debug(`env:${toStr(env)}`); // This is never reached, perhaps createInputObjectType doesn't have resolver...
					return '';
				}*/
			}
		}
	});

	const graphqlInputTypeFilterHasValueWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterHasValueWithDynamicFields',
		fields: {
			field: { type: nonNull(enumTypeFilterFields) },
			values: { type: nonNull(list(GraphQLString)) }
		}
	});

	const graphqlInputTypeFilterNotExistsWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterNotExistsWithDynamicFields',
		fields: {
			field: {
				type: nonNull(enumTypeFilterFields)
			}
		}
	});

	const graphqlInputTypeFilterBooleanDynamicFields = {
		exists: { type: graphqlInputTypeFilterExistsWithDynamicFields },
		hasValue: { type: graphqlInputTypeFilterHasValueWithDynamicFields },
		ids: { type: GRAPHQL_INPUT_TYPE_FILTER_IDS },
		notExists: { type: graphqlInputTypeFilterNotExistsWithDynamicFields }
	};

	const graphqlInputTypeFilterBooleanWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterBooleanWithDynamicFields',
		fields: {
			must: { type: list(createInputObjectType({
				name: 'InputTypeFilterBooleanMust',
				fields: graphqlInputTypeFilterBooleanDynamicFields
			}))},
			mustNot: { type: list(createInputObjectType({
				name: 'InputTypeFilterBooleanMustNot',
				fields: graphqlInputTypeFilterBooleanDynamicFields
			}))},
			should: { type: list(createInputObjectType({
				name: 'InputTypeFilterBooleanShould',
				fields: graphqlInputTypeFilterBooleanDynamicFields
			}))}
		}
	});

	const interfaceSearchHitsFields = {
		_highlight: { type: createObjectType({
			name: 'InterfaceSearchHitsHighlights',
			fields: interfaceSearchHitsHighlightsFields // This list can't be empty when createObjectType is called?
		})},
		_json: { type: GraphQLJson },
		_score: { type: GraphQLFloat }
	};
	Object.keys(interfaceSearchHitsFieldsFromSchema).forEach((k) => {
		interfaceSearchHitsFields[k] = interfaceSearchHitsFieldsFromSchema[k];
	});

	const highlightProperties = createInputObjectType({
		name: 'HighlightParameterProperties',
		fields: highlightParameterPropertiesFields
	});

	return createSchema({
		//dictionary:,
		//mutation:,
		query: createObjectType({
			name: 'Query',
			fields: {
				search: {
					args: {
						aggregations: list(createInputObjectType({
							name: 'InputObjectAggregations',
							fields: {
								name: { type: nonNull(GraphQLString) },
								terms: { type: GRAPHQL_INPUT_TYPE_AGGREGATION_TERMS }/*,
								aggregations: { // TODO subAggregations
									type: reference('InputObjectAggregations')
								}*/
							}
						})),
						filters: createInputObjectType({
							name: 'FiltersParameter',
							fields: {
								boolean: {
									//type: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN
									type: graphqlInputTypeFilterBooleanWithDynamicFields
								},
								exists: {
									//type: GRAPHQL_INPUT_TYPE_FILTER_EXISTS
									type: graphqlInputTypeFilterExistsWithDynamicFields
								},
								hasValue: {
									//type: GRAPHQL_INPUT_TYPE_FILTER_HAS_VALUE
									type: graphqlInputTypeFilterHasValueWithDynamicFields
								},
								ids: { type: GRAPHQL_INPUT_TYPE_FILTER_IDS },
								notExists: {
									//type: GRAPHQL_INPUT_TYPE_FILTER_NOT_EXISTS
									type: graphqlInputTypeFilterNotExistsWithDynamicFields
								}
							}
						}),
						highlight: createInputObjectType({
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
								aggregations: aggregationsArg,
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

						//log.debug(`aggregationsArg:${toStr(aggregationsArg)}`);
						const aggregations = {};
						aggregationsArg.forEach(({name, ...rest}) => {
							/*if (isSet(aggregations[name])) {
								// TODO Throw GraphQLError
							}*/
							aggregations[name] = rest;
						});
						//log.debug(`aggregations:${toStr(aggregations)}`);

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
							aggregations,
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

						queryRes.aggregations = Object.keys(queryRes.aggregations).map((name) => ({
							name,
							buckets: queryRes.aggregations[name].buckets
						}));

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
					type: createObjectType({
						name: 'InterfaceSearch',
						fields: {
							aggregations: { type: list(createObjectType({
								name: 'InterfaceSearchAggregations',
								fields: {
									name: { type: nonNull(GraphQLString) },
									buckets: { type: list(createObjectType({
										name: 'InterfaceSearchAggregationsBuckets',
										fields: {
											docCount: { type: nonNull(GraphQLInt) },
											key: { type: nonNull(GraphQLString) }
										}
									}))}
								}
							}))},
							count: { type: nonNull(GraphQLInt) },
							hits: { type: list(createObjectType({
								name: 'InterfaceSearchHits',
								fields: interfaceSearchHitsFields
							}))},
							total: { type: nonNull(GraphQLInt) }
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
	const prefix = 'Explorer-Api-Key ';
	if(!authorization || !authorization.startsWith(prefix)) {
		return { status: 401 }; // Unauthorized
	}
	const apiKey = authorization.substring(prefix.length);
	log.debug(`apiKey:${toStr(apiKey)}`);
	if (!apiKey) {
		return { status: 401 }; // Unauthorized
	}

	// TODO get apiKey from authorization header...
	//log.debug(`interfaceName:${toStr(interfaceName)}`);
	const body = JSON.parse(bodyJson);
	const {query, variables} = body;
	//log.debug(`query:${toStr(query)}`);
	//log.debug(`variables:${toStr(variables)}`);
	const context = {};
	//log.debug(`context:${toStr(context)}`);
	return {
		contentType: RESPONSE_TYPE_JSON,
		body: execute(generateSchemaForInterface(interfaceName), query, variables, context)
	};
}

/*
{
	search(
    aggregations: [{
      name: "myTitleAggregation",
      terms: {
        field: "title"
        order: "_term ASC"
        size: 10
        minDocCount: 0
      }
    },{
      name: "myUriAggregation",
      terms: {
        field: "uri"
        order: "_term ASC"
        size: 10
        minDocCount: 0
      }
    }]
    #filters: {
      #boolean: {
        #must: {
          #exists: {
           	#field: title
          #}
          #hasValue: {
          #  field: title
          #  values: "Example Domain"
          #}
          #ids: {
          #  values: "530e980b-89dc-4522-af0f-df4b420a1f81"
          #}
          #notExists: {
          #  field: title
          #}
        #} #must
        #mustNot: {
          #exists: {
          # 	field: title
          #}
          #hasValue: {
          #  field: "title"
          #  values: "Example Domain"
          #}
          #ids: {
          #  values: "530e980b-89dc-4522-af0f-df4b420a1f81"
          #}
          #notExists: {
          #  field: "nonExistant" # This is not possible, only enums
          #}
        #} # mustNot
        #should: [{
        #  exists: {
        #   	field: title
        #  }
        #},{
        #  exists: {
        #   	field: text
        #	}
        #}] # should
      #} # boolean
      #exists: {
          #field: text
          #field: "nonExistant" # This is not possible, only enums
      #}
      #hasValue: {
          #field: title
          #values: "Example Domain"
        	#values: ["Example Domain"]
      		#values: "nonExistant" # This is not possible, only enums
      #}
      #ids: {
          #values: "530e980b-89dc-4522-af0f-df4b420a1f81"
      		#values: "nonExistant"
      #}
      #notExists: {
      #  field: title
      #}
    #} #filters
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
    aggregations {
      name
      buckets {
        docCount
        key
      }
    }
    count
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
    total
  }
}
*/
