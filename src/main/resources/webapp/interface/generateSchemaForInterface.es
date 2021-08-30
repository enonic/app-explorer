import {
	QUERY_OPERATOR_AND,
	VALUE_TYPE_ANY,
	VALUE_TYPE_SET,
	addQueryFilter,
	camelize,
	//forceArray,
	fulltext,
	//group,
	or,
	isSet,
	ngram,
	toStr,
	stemmed,
	ucFirst
} from '@enonic/js-utils';
import {
	GraphQLBoolean,
	//GraphQLDouble, // There is no such type
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	Json as GraphQLJson,
	list,
	newSchemaGenerator,
	nonNull,
	reference
} from '/lib/graphql';
import {
	//createConnectionType,
	decodeCursor,
	encodeCursor
} from '/lib/graphql-connection';

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


//import {schemaGenerator} from './schemaGenerator';

import {generateEnumTypes} from './enumTypes';
/*import {
	GRAPHQL_ENUM_TYPE_AGGREGATION_GEO_DISTANCE_UNIT,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ENCODER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_TAG_SCHEMA
} from './enumTypes';*/

import {generateInputTypes} from './inputTypes';
/*import {
	GRAPHQL_INPUT_TYPE_FILTER_IDS
} from './inputTypes';*/

import {generateTypes} from './types';
//import {OBJECT_TYPE_AGGREGATIONS_UNION} from './types';

import {valueTypeToGraphQLType} from './valueTypeToGraphQLType';
import {aggregationQueryTypeToGraphQLType} from './aggregationQueryTypeToGraphQLType';
import {washDocumentNode} from './washDocumentNode';

const schemaGenerator = newSchemaGenerator();
const {
	createEnumType,
	createInputObjectType,
	createObjectType,
	createSchema
} = schemaGenerator;
//import {DEFAULT_INTERFACE_FIELDS} from '../constants';

const {
	GRAPHQL_ENUM_TYPE_AGGREGATION_GEO_DISTANCE_UNIT,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ENCODER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_FRAGMENTER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_ORDER,
	GRAPHQL_ENUM_TYPE_HIGHLIGHT_OPTION_TAG_SCHEMA
} = generateEnumTypes(schemaGenerator);

const {
	GRAPHQL_INPUT_TYPE_FILTER_IDS
} = generateInputTypes(schemaGenerator);

const {OBJECT_TYPE_AGGREGATIONS_UNION} = generateTypes(schemaGenerator);

const INPUT_OBJECT_TYPE_SUB_AGGREGATIONS_NAME = 'InputObjectTypeSubAggregations';


export function generateSchemaForInterface(interfaceName) {
	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const interfaceNode = getInterface({
		connection: explorerRepoReadConnection,
		interfaceName
	});
	//log.debug(`interfaceNode:${toStr(interfaceNode)}`);
	const {
		collections,
		fields,// = DEFAULT_INTERFACE_FIELDS, TODO This wont work when fields = [] which filter does
		stopWords//,
		//synonyms // TODO
	} = filterInterface(interfaceNode);
	//log.debug(`collections:${toStr(collections)}`);
	//log.debug(`fields:${toStr(fields)}`);
	//log.debug(`stopWords:${toStr(stopWords)}`);
	//log.debug(`synonyms:${toStr(synonyms)}`);

	const fieldsRes = getFields({
		connection: explorerRepoReadConnection,
		includeSystemFields: true
	});
	//log.debug(`fieldsRes:${toStr(fieldsRes)}`);
	//log.debug(`fieldsRes.hits[0]:${toStr(fieldsRes.hits[0])}`);

	const camelToFieldObj = {};
	const enumFieldsValues = [];
	const highlightParameterPropertiesFields = {};
	const interfaceSearchHitsFieldsFromSchema = {};
	const interfaceSearchHitsHighlightsFields = {};
	//log.debug(`fieldsRes.hits:${toStr(fieldsRes.hits)}`);
	fieldsRes.hits.forEach(({
		fieldType: valueType,
		isSystemField = false,
		key/*,
		max, // TODO nonNull list
		min*/
	}) => {
		if (valueType) {
			const camelizedFieldKey = camelize(key, /[.-]/g);
			camelToFieldObj[camelizedFieldKey] = key;
			//log.debug(`key:${toStr(key)} camelized:${toStr(camelizedFieldKey)}`);
			if (![VALUE_TYPE_ANY, VALUE_TYPE_SET].includes(valueType)) {
				enumFieldsValues.push(camelizedFieldKey);
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
	//log.debug(`camelToFieldObj:${toStr(camelToFieldObj)}`);

	// Name must be non-null, non-empty and match [_A-Za-z][_0-9A-Za-z]* - was 'GraphQLScalarType{name='String', description='Built-in String', coercing=graphql.Scalars$3@af372a4}'
	//enumFieldsValues.push(GraphQLString);

	//log.debug(`enumFieldsValues:${toStr(enumFieldsValues)}`);
	//log.debug(`highlightParameterPropertiesFields:${toStr(highlightParameterPropertiesFields)}`);

	const enumFields = createEnumType({
		name: 'enumFields',
		values: enumFieldsValues
	});

	//──────────────────────────────────────────────────────────────────────────
	// Filters
	//──────────────────────────────────────────────────────────────────────────
	const graphqlInputTypeFilterExistsWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterExistsWithDynamicFields',
		fields: {
			field: {
				type: nonNull(enumFields)
			}
		}
	});

	const graphqlInputTypeFilterHasValueWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterHasValueWithDynamicFields',
		fields: {
			field: { type: nonNull(enumFields) },
			values: { type: nonNull(list(GraphQLString)) }
		}
	});

	const graphqlInputTypeFilterNotExistsWithDynamicFields = createInputObjectType({
		name: 'InputTypeFilterNotExistsWithDynamicFields',
		fields: {
			field: {
				type: nonNull(enumFields)
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

	//──────────────────────────────────────────────────────────────────────────

	const interfaceSearchHitsFields = {
		_highlight: { type: createObjectType({
			name: 'InterfaceSearchHitsHighlights',
			fields: interfaceSearchHitsHighlightsFields // This list can't be empty when createObjectType is called?
		})},
		_json: { type: GraphQLJson },
		_score: { type: GraphQLFloat }
	};
	//log.debug(`Object.keys(interfaceSearchHitsFieldsFromSchema):${toStr(Object.keys(interfaceSearchHitsFieldsFromSchema))}`);
	Object.keys(interfaceSearchHitsFieldsFromSchema).forEach((k) => {
		interfaceSearchHitsFields[k] = interfaceSearchHitsFieldsFromSchema[k];
	});

	const highlightProperties = createInputObjectType({
		name: 'HighlightParameterProperties',
		fields: highlightParameterPropertiesFields
	});

	function searchResolver(env) {
		const {
			args: {
				aggregations: aggregationsArg = [],
				count = 10,
				filters = {},
				highlight = {},
				searchString = '',
				start = 0
			}
		} = env;
		//log.debug(`filters:${toStr(filters)}`);
		//log.debug(`highlight:${toStr(highlight)}`);

		//log.debug(`aggregationsArg:${toStr(aggregationsArg)}`);

		function aggregationsArgToQueryParamAndTypes(aggregationsArray = []) {
			//log.debug(`aggregationsArray:${toStr(aggregationsArray)}`);
			const aggregationsObj = {};
			const typesObj = {};
			//log.debug(`aggregationsArray:${toStr(aggregationsArray)}`);
			aggregationsArray.forEach(({
				name,
				subAggregations,
				...rest
			}) => {
				//log.debug(`rest:${toStr(rest)}`);
				/*if (isSet(aggregations[name])) {
					// TODO Throw GraphQLError
				}*/
				typesObj[name] = { type: Object.keys(rest)[0] };
				if (rest[Object.keys(rest)[0]].field) {
					// TODO Workaround related to https://github.com/enonic/app-explorer/issues/275
					rest[Object.keys(rest)[0]].field = camelToFieldObj[rest[Object.keys(rest)[0]].field];
				}
				aggregationsObj[name] = rest;
				if (subAggregations) {
					[
						aggregationsObj[name].aggregations,
						typesObj[name].types
					] = aggregationsArgToQueryParamAndTypes(
						subAggregations,
					); // recurse
				}
			});
			return [aggregationsObj, typesObj];
		}
		const [aggregations, types] = aggregationsArgToQueryParamAndTypes(aggregationsArg);
		//log.debug(`aggregations:${toStr(aggregations)}`);
		//log.debug(`types:${toStr(types)}`);

		//log.debug(`searchString:${toStr(searchString)}`);
		const washedSearchString = wash({string: searchString});
		//log.debug(`washedSearchString:${toStr({washedSearchString})}`);

		// TODO stopWords could be cached:
		const listOfStopWords = [];
		if (stopWords && stopWords.length) {
			//log.debug(`stopWords:${toStr(stopWords)}`);
			stopWords.forEach((name) => {
				const {words} = getStopWordsList({ // Not a query
					connection: explorerRepoReadConnection,
					name
				});
				//log.debug(`words:${toStr(words)}`);
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
			count,
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_DOCUMENT]),
				filters
			}),
			highlight,
			//query: `fulltext('${fields.map(({name: field, boost = 1}) => `${field}${boost && boost > 1 ? `^${boost}` : ''}`)}', '${searchStringWithoutStopWords}', 'AND')`,
			query: or(fulltext(
				fields.map(({boost, name: field}) => ({boost, field})),
				searchStringWithoutStopWords,
				QUERY_OPERATOR_AND
			),stemmed(
				fields.map(({boost, name: field}) => ({boost, field})),
				searchStringWithoutStopWords,
				QUERY_OPERATOR_AND,
				//language // TODO
			),ngram(
				fields.map(({boost, name: field}) => ({boost, field})),
				searchStringWithoutStopWords,
				QUERY_OPERATOR_AND
			)),
			start
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
		log.debug(`multiConnectParams:${toStr(multiConnectParams)}`);

		const multiRepoReadConnection = multiConnect(multiConnectParams);

		const queryRes = multiRepoReadConnection.query(queryParams);
		log.debug(`queryRes:${toStr(queryRes)}`);

		function queryResAggregationsObjToArray(obj, localTypes = types) {
			//log.debug(`obj:${toStr(obj)}`);
			//log.debug(`localTypes:${toStr(localTypes)}`);
			return Object.keys(obj).map((name) => {
				//log.debug(`name:${toStr(name)}`);
				const anAggregation = obj[name];
				//log.debug(`anAggregation:${toStr(anAggregation)}`);
				const {
					//avg, TODO https://github.com/enonic/xp/issues/9003
					buckets,
					count,
					//max,
					//min,
					sum,
					value
				} = anAggregation;
				/*log.debug(`avg:${toStr(avg)}`);
				log.debug(`typeof avg:${toStr(typeof avg)}`);
				log.debug(`parseFloat(avg):${toStr(parseFloat(avg))}`);
				log.debug(`typeof parseFloat(avg):${toStr(typeof parseFloat(avg))}`);*/
				const rAggregation = {
					count,
					name,
					sum,
					type: aggregationQueryTypeToGraphQLType(localTypes[name].type)
				};
				/*if (isSet(avg) && isSet(parseFloat(avg))) {rAggregation.avg = avg;}
				if (isSet(max) && isSet(parseFloat(max))) {rAggregation.max = max;}
				if (isSet(min) && isSet(parseFloat(min))) {rAggregation.min = min;}*/
				if (buckets) {
					rAggregation.buckets = buckets.map(({
						docCount,
						from,
						key,
						to,
						...rest
					}) => {
						const rBucket = {
							docCount,
							key
						};
						if (isSet(from) || isSet(to)) {
							rAggregation.from = from;
							rAggregation.to = to;
						}
						//log.debug(`rest:${toStr(rest)}`);
						if (Object.keys(rest).length) {
							rBucket.subAggregations = queryResAggregationsObjToArray(rest, types[name].types); // Recurse
						}
						return rBucket;
					}); // map buckets
				} else {
					if (isSet(value)) {
						rAggregation.value = value;
					}
				} // if buckets
				return rAggregation;
			}); // map names
		}
		queryRes.aggregations = queryResAggregationsObjToArray(queryRes.aggregations);
		//log.debug(`queryRes.aggregations:${toStr(queryRes.aggregations)}`);

		queryRes.aggregationsAsJson = JSON.stringify(queryRes.aggregations);

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
		//log.debug(`queryRes:${toStr(queryRes)}`);

		return queryRes;
	}

	const objectTypeInterfaceSearchHit = createObjectType({
		name: 'InterfaceSearchHits',
		fields: interfaceSearchHitsFields
	});

	//const OBJECT_TYPE_AGGREGATIONS_NAME = 'InterfaceSearchAggregations';
	const objectTypeInterfaceSearch = createObjectType({
		name: 'InterfaceSearch',
		fields: {
			aggregations: { type: list(OBJECT_TYPE_AGGREGATIONS_UNION) },
			aggregationsAsJson: { type: GraphQLJson },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(objectTypeInterfaceSearchHit)},
			total: { type: nonNull(GraphQLInt) }
		}
	});

	//──────────────────────────────────────────────────────────────────────────
	// Dynamic Input Types
	//──────────────────────────────────────────────────────────────────────────

	const inputTypeAggregationCount = createInputObjectType({
		name: 'InputObjectTypeAggregationCount',
		fields: {
			field: {
				type: nonNull(enumFields)
			}
		}
	});
	const inputTypeAggregationDateHistogram = createInputObjectType({
		name: 'InputObjectTypeAggregationDateHistogram',
		fields: {
			field: {
				type: nonNull(enumFields)
			},
			format: { // yyyy-MM-dd’T’HH:mm:ss.SSSZ
				type: GraphQLString
			},
			interval: { // y M d H m s
				type: GraphQLString
			},
			minDocCount: {
				type: GraphQLInt
			}
		}
	});
	const inputTypeAggregationDateRange = createInputObjectType({
		name: 'InputObjectTypeAggregationDateRange',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			},
			format: { // yyyy-MM-dd’T’HH:mm:ss.SSSZ
				type: GraphQLString
			},
			ranges: {
				type: list(createInputObjectType({
					name: 'InputObjectTypeAggregationDateRangeRanges',
					fields: {
						from: { type: GraphQLString },
						to: { type: GraphQLString }
					}
				}))
			}
		}
	});
	const inputTypeAggregationGeoDistance = createInputObjectType({
		name: 'InputObjectTypeAggregationGeoDistance',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			},
			origin: {
				type: createInputObjectType({
					name: 'InputObjectTypeAggregationGeoDistanceOrigin',
					fields: {
						lat: { type: GraphQLString },
						lon: { type: GraphQLString }
					}
				})
			},
			ranges: {
				type: list(createInputObjectType({
					name: 'InputObjectTypeAggregationGeoDistanceRanges',
					fields: {
						from: { type: GraphQLFloat },
						to: { type: GraphQLFloat }
					}
				}))
			},
			unit: {
				type: nonNull(GRAPHQL_ENUM_TYPE_AGGREGATION_GEO_DISTANCE_UNIT)
			}
		}
	});
	const inputTypeAggregationMax = createInputObjectType({
		name: 'InputObjectTypeAggregationMax',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			}
		}
	});
	const inputTypeAggregationMin = createInputObjectType({
		name: 'InputObjectTypeAggregationMin',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			}
		}
	});
	const inputTypeAggregationRange = createInputObjectType({
		name: 'InputObjectTypeAggregationRange',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			},
			ranges: {
				type: list(createInputObjectType({
					name: 'InputObjectTypeAggregationRangeRanges',
					fields: {
						from: { type: GraphQLFloat },
						to: { type: GraphQLFloat }
					}
				}))
			}
		}
	});
	const inputTypeAggregationStats = createInputObjectType({
		name: 'InputObjectTypeAggregationStats',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			}
		}
	});
	const inputTypeAggregationTerms = createInputObjectType({
		name: 'InputObjectTypeAggregationTerms',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
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

	const inputObjectTypeAggregations = createInputObjectType({
		name: 'InputObjectTypeAggregations',
		fields: {
			name: { type: nonNull(GraphQLString) },
			count: { type: inputTypeAggregationCount },
			dateHistogram: { type: inputTypeAggregationDateHistogram },
			dateRange: { type: inputTypeAggregationDateRange },
			geoDistance: { type: inputTypeAggregationGeoDistance },
			// max, min and stats makes no sense on top level
			range: { type: inputTypeAggregationRange },
			terms: { type: inputTypeAggregationTerms },
			subAggregations: {
				type: list(createInputObjectType({
					name: INPUT_OBJECT_TYPE_SUB_AGGREGATIONS_NAME,
					fields: {
						name: { type: nonNull(GraphQLString) },
						count: { type: inputTypeAggregationCount },
						dateHistogram: { type: inputTypeAggregationDateHistogram },
						dateRange: { type: inputTypeAggregationDateRange },
						geoDistance: { type: inputTypeAggregationGeoDistance },
						max: { type: inputTypeAggregationMax },
						min: { type: inputTypeAggregationMin },
						stats: { type: inputTypeAggregationStats },
						range: { type: inputTypeAggregationRange },
						terms: { type: inputTypeAggregationTerms },
						subAggregations: {
							type: list(reference(INPUT_OBJECT_TYPE_SUB_AGGREGATIONS_NAME))
						}
					} // fields
				}))
			}
		} // fields
	});

	const inputObjectTypeFilters = createInputObjectType({
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
	});

	const inputObjectTypeHighlight = createInputObjectType({
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
	});

	return createSchema({
		//dictionary:,
		//mutation:,
		query: createObjectType({
			name: 'Query',
			fields: {
				getSearchConnection: {
					args: {
						after: GraphQLString,
						aggregations: list(inputObjectTypeAggregations),
						filters: inputObjectTypeFilters,
						first: GraphQLInt,
						highlight: inputObjectTypeHighlight,
						searchString: GraphQLString
					},
					resolve(env) {
						//log.debug(`env:${toStr({env})}`);
						const {
							after,// = encodeCursor('0'), // encoded representation of start
							aggregations,
							filters,
							first = 10, // count
							highlight,
							searchString
						} = env.args;
						//log.debug(`after:${toStr({after})}`);
						//log.debug(`first:${toStr({first})}`);
						const start = after ? parseInt(decodeCursor(after)) + 1 : 0;
						//log.debug(`start:${toStr({start})}`);
						const res = searchResolver({
							args: {
								aggregations,
								count: first,
								filters,
								highlight,
								searchString,
								start
							}
						});
						//log.debug(`res:${toStr({res})}`);
						res.start = start;
						//log.debug(`res:${toStr({res})}`);
						return res;
					},
					//type: createConnectionType(schemaGenerator, objectTypeInterfaceSearch)
					type: createObjectType({
						name: 'InterfaceSearchConnection',
						fields: {
							totalCount: {
								resolve: (env) => env.source.total,
								type: nonNull(GraphQLInt)
							},
							edges: {
								resolve(env) {
									//log.debug(`edges env:${toStr({env})}`);
									let hits = env.source.hits;
									let edges = [];
									for (let i = 0; i < hits.length; i++) {
										edges.push({
											node: hits[i],
											cursor: env.source.start + i
										});
									}
									//log.debug(`edges:${toStr({edges})}`);
									return edges;
								},
								type: list(createObjectType({
									name: 'InterfaceSearchConnectionEdge',
									fields: {
										cursor: {
											type: nonNull(GraphQLString),
											resolve(env) {
												//log.debug(`cursor env:${toStr({env})}`);
												return env.source.cursor;
											}
										},
										node: {
											type: objectTypeInterfaceSearchHit,
											resolve(env) {
												//log.debug(`node env:${toStr({env})}`);
												return env.source.node;
											}
										}
									}
								}))
							},
							pageInfo: {
								resolve(env) {
									let count = env.source.hits.length;
									return {
										startCursor: env.source.start,
										endCursor: env.source.start + (count === 0 ? 0 : (count - 1)),
										hasNext: (env.source.start + count) < env.source.total
									};
								},
								type: createObjectType({
									name: 'InterfaceSearchConnectionPageInfo',
									fields: {
										endCursor: {
											type: nonNull(GraphQLString),
											resolve: (env) => encodeCursor(env.source.endCursor)
										},
										hasNext: {
											type: nonNull(GraphQLBoolean),
											resolve: (env) => env.source.hasNext
										},
										startCursor: {
											type: nonNull(GraphQLString),
											resolve: (env) => encodeCursor(env.source.startCursor)
										}
									}
								})
							},
							aggregations: { type: list(OBJECT_TYPE_AGGREGATIONS_UNION) },
							aggregationsAsJson: { type: GraphQLJson }
						}
					})
				},
				search: {
					args: {
						aggregations: list(inputObjectTypeAggregations),
						count: GraphQLInt,
						filters: inputObjectTypeFilters,
						highlight: inputObjectTypeHighlight,
						searchString: GraphQLString,
						start: GraphQLInt
					},
					resolve: (env) => searchResolver(env),
					type: objectTypeInterfaceSearch
				}
			}
		})
		//subscription:
	});
}
