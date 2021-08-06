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
	//forceArray,
	//isSet,
	toStr,
	ucFirst
} from '@enonic/js-utils';
import {
	execute,
	Date as GraphQLDate,
	DateTime as GraphQLDateTime,
	GraphQLBoolean,
	//GraphQLDouble, // There is no such type
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
import {
	createConnectionType,
	decodeCursor,
	encodeCursor
} from '/lib/graphql-connection';

import {getFields} from '/lib/explorer/field/getFields';
import {exists as interfaceExists} from '/lib/explorer/interface/exists';
import {get as getInterface} from '/lib/explorer/interface/get';
import {filter as filterInterface} from '/lib/explorer/interface/filter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {
	COLLECTION_REPO_PREFIX,
	NT_API_KEY,
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {removeStopWords} from '/lib/explorer/query/removeStopWords';
import {wash} from '/lib/explorer/query/wash';
import {connect} from '/lib/explorer/repo/connect';
import {multiConnect} from '/lib/explorer/repo/multiConnect';
import {get as getStopWordsList} from '/lib/explorer/stopWords/get';
import {hash} from '/lib/explorer/string/hash';

const schemaGenerator = newSchemaGenerator();

const {
	createEnumType,
	createInputObjectType,
	createObjectType,
	createSchema/*,
	createUnionType*/
} = schemaGenerator;
//import {DEFAULT_INTERFACE_FIELDS} from '../constants';


const GRAPHQL_ENUM_TYPE_AGGREGATION_GEO_DISTANCE_UNIT = createEnumType({
	name: 'EnumTypeAggregationGeoDistanceUnit',
	values: {
		'km': 'km',
		'm': 'm',
		'cm': 'cm',
		'mm': 'mm',
		'mi': 'mi',
		'yd': 'yd',
		'ft': 'ft',
		'nmi': 'nmi',
		kilometers: 'km',
		meters: 'm',
		centimeters: 'cm',
		millimeters: 'mm',
		miles: 'mi',
		yards: 'yd',
		feet: 'ft',
		nauticalmiles: 'nmi'
	}
});

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

/*const GRAPHQL_INPUT_TYPE_AGGREGATION_TERMS = createInputObjectType({
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
});*/

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

	const camelToFieldObj = {};
	const enumFieldsValues = [];
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
	log.debug(`camelToFieldObj:${toStr(camelToFieldObj)}`);

	// Name must be non-null, non-empty and match [_A-Za-z][_0-9A-Za-z]* - was 'GraphQLScalarType{name='String', description='Built-in String', coercing=graphql.Scalars$3@af372a4}'
	//enumFieldsValues.push(GraphQLString);

	//log.debug(`enumFieldsValues:${toStr(enumFieldsValues)}`);
	//log.debug(`highlightParameterPropertiesFields:${toStr(highlightParameterPropertiesFields)}`);

	const enumFields = createEnumType({
		name: 'enumFields',
		values: enumFieldsValues
	});

	/* Can't union enum and scalar, only object...
	const unionTypeFilterExistsWithDynamicFieldsField = createUnionType({
		name: 'UnionTypeFilterExistsWithDynamicFieldsField',
		types: [
			nonNull(enumFields),
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
				type: nonNull(enumFields)/*,
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

	function searchResolver(env) {
		const {
			args: {
				aggregations: aggregationsArg,
				count = 10,
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
				searchString = '',
				start = 0
			}
		} = env;
		//log.debug(`filters:${toStr(filters)}`);
		//log.debug(`highlight:${toStr(highlight)}`);

		//log.debug(`aggregationsArg:${toStr(aggregationsArg)}`);

		function aggregationsArgToQueryParam(aggregationsArray) {
			//log.debug(`aggregationsArray:${toStr(aggregationsArray)}`);
			const aggregationsObj = {};
			aggregationsArray.forEach(({
				name,
				subAggregations,
				...rest
			}) => {
				//log.debug(`rest:${toStr(rest)}`);
				/*if (isSet(aggregations[name])) {
					// TODO Throw GraphQLError
				}*/
				if (rest[Object.keys(rest)[0]].field) {
					// TODO Workaround related to https://github.com/enonic/app-explorer/issues/275
					rest[Object.keys(rest)[0]].field = camelToFieldObj[rest[Object.keys(rest)[0]].field];
				}
				aggregationsObj[name] = rest;
				if (subAggregations) {
					aggregationsObj[name].aggregations = aggregationsArgToQueryParam(
						subAggregations
					); // recurse
				}
			});
			return aggregationsObj;
		}
		const aggregations = aggregationsArgToQueryParam(aggregationsArg);
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
			count,
			filters: addQueryFilter({
				filter: hasValue('_nodeType', [NT_DOCUMENT]),
				filters
			}),
			highlight,
			query: `fulltext('${fields.map(({name: field, boost = 1}) => `${field}${boost && boost > 1 ? `^${boost}` : ''}`)}', '${searchStringWithoutStopWords}', 'AND')`,
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
		//log.debug(`multiConnectParams:${toStr(multiConnectParams)}`);

		const multiRepoReadConnection = multiConnect(multiConnectParams);

		const queryRes = multiRepoReadConnection.query(queryParams);
		log.debug(`queryRes:${toStr(queryRes)}`);

		function queryResAggregationsObjToArray(obj) {
			//log.debug(`obj:${toStr(obj)}`);
			return Object.keys(obj).map((name) => {
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
					value
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
							from,
							key,
							to
						};
						//log.debug(`rest:${toStr(rest)}`);
						if (Object.keys(rest).length) {
							rBucket.subAggregations = queryResAggregationsObjToArray(rest); // Recurse
						}
						return rBucket;
					}); // map buckets
				}
				return rAggregation;
			}); // map names
		}
		queryRes.aggregationsAsJson = JSON.stringify(queryRes.aggregations);
		queryRes.aggregations = queryResAggregationsObjToArray(queryRes.aggregations);
		//log.debug(`queryRes.aggregations:${toStr(queryRes.aggregations)}`);

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
		log.debug(`queryRes:${toStr(queryRes)}`);

		return queryRes;
	}

	const OBJECT_TYPE_AGGREGATIONS_NAME = 'InterfaceSearchAggregations';
	const objectTypeInterfaceSearch = createObjectType({
		name: 'InterfaceSearch',
		fields: {
			aggregations: { type: list(createObjectType({
				name: OBJECT_TYPE_AGGREGATIONS_NAME,
				fields: {
					avg: { type: GraphQLFloat }, // Can't nonNull since not in terms result
					count: { type: GraphQLInt }, // Can't nonNull since not in terms result
					buckets: { type: list(createObjectType({ // Can't nonNull since not in stats result
						name: 'InterfaceSearchAggregationsBuckets',
						fields: {
							docCount: { type: nonNull(GraphQLInt) },
							from: { type: GraphQLInt }, // Can't nonNull since not in terms result
							key: { type: nonNull(GraphQLString) },
							subAggregations: {
								type: list(reference(OBJECT_TYPE_AGGREGATIONS_NAME))
							},
							to: { type: GraphQLInt } // Can't nonNull since not in terms result
						}
					}))},
					name: { type: nonNull(GraphQLString) },
					max: { type: GraphQLFloat }, // Can't nonNull since not in terms result
					min: { type: GraphQLFloat }, // Can't nonNull since not in terms result
					sum: { type: GraphQLFloat }, // Can't nonNull since not in terms result
					value: { type: GraphQLFloat } // Can't nonNull since not in terms result
				}
			}))},
			aggregationsAsJson: { type: GraphQLJson },
			count: { type: nonNull(GraphQLInt) },
			hits: { type: list(createObjectType({
				name: 'InterfaceSearchHits',
				fields: interfaceSearchHitsFields
			}))},
			total: { type: nonNull(GraphQLInt) }
		}
	});

	const INPUT_OBJECT_TYPE_AGGREGATION_COUNT = createInputObjectType({
		name: 'InputObjectTypeAggregationCount',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			}
		}
	});
	const INPUT_OBJECT_TYPE_AGGREGATION_DATE_RANGE = createInputObjectType({
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
	const INPUT_OBJECT_TYPE_AGGREGATION_GEO_DISTANCE = createInputObjectType({
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
	const INPUT_OBJECT_TYPE_AGGREGATION_MAX = createInputObjectType({
		name: 'InputObjectTypeAggregationMax',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			}
		}
	});
	const INPUT_OBJECT_TYPE_AGGREGATION_MIN = createInputObjectType({
		name: 'InputObjectTypeAggregationMin',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			}
		}
	});
	const INPUT_OBJECT_TYPE_AGGREGATION_RANGE = createInputObjectType({
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
	const INPUT_OBJECT_TYPE_AGGREGATION_STATS = createInputObjectType({
		name: 'InputObjectTypeAggregationStats',
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFields)
			}
		}
	});
	const INPUT_OBJECT_TYPE_AGGREGATION_TERMS = createInputObjectType({
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

	const INPUT_OBJECT_TYPE_SUB_AGGREGATIONS_NAME = 'InputObjectTypeSubAggregations';
	const inputObjectTypeAggregations = createInputObjectType({
		name: 'InputObjectTypeAggregations',
		fields: {
			name: { type: nonNull(GraphQLString) },
			count: { type: INPUT_OBJECT_TYPE_AGGREGATION_COUNT },
			dateRange: { type: INPUT_OBJECT_TYPE_AGGREGATION_DATE_RANGE },
			geoDistance: { type: INPUT_OBJECT_TYPE_AGGREGATION_GEO_DISTANCE },
			// max, min and stats makes no sense on top level
			range: { type: INPUT_OBJECT_TYPE_AGGREGATION_RANGE },
			terms: { type: INPUT_OBJECT_TYPE_AGGREGATION_TERMS },
			subAggregations: {
				type: list(createInputObjectType({
					name: INPUT_OBJECT_TYPE_SUB_AGGREGATIONS_NAME,
					fields: {
						name: { type: nonNull(GraphQLString) },
						count: { type: INPUT_OBJECT_TYPE_AGGREGATION_COUNT },
						dateRange: { type: INPUT_OBJECT_TYPE_AGGREGATION_DATE_RANGE },
						geoDistance: { type: INPUT_OBJECT_TYPE_AGGREGATION_GEO_DISTANCE },
						max: { type: INPUT_OBJECT_TYPE_AGGREGATION_MAX },
						min: { type: INPUT_OBJECT_TYPE_AGGREGATION_MIN },
						stats: { type: INPUT_OBJECT_TYPE_AGGREGATION_STATS },
						range: { type: INPUT_OBJECT_TYPE_AGGREGATION_RANGE },
						terms: { type: INPUT_OBJECT_TYPE_AGGREGATION_TERMS },
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
						//aggregations: list(inputObjectTypeAggregations),
						//filters: inputObjectTypeFilters,
						first: GraphQLInt,
						//highlight: inputObjectTypeHighlight,
						searchString: GraphQLString
					},
					resolve: (env) => {
						log.debug(`env:${toStr({env})}`);
						const {
							after = encodeCursor('0'), // encoded representation of start
							//aggregations,
							//filters,
							first, // count
							//highlight,
							searchString
						} = env.args;
						log.debug(`after:${toStr({after})}`);
						log.debug(`first:${toStr({first})}`);
						const start = (after && parseInt(decodeCursor(after))) || 0;
						log.debug(`start:${toStr({start})}`);
						const node = searchResolver({
							//aggregations,
							count: first,
							//filters,
							//highlight,
							searchString,
							start
						});
						const totalCount = node.total;
						// TODO I have no idea if these are correct!
						const endCursor = encodeCursor(totalCount - first);
						const hasNext = totalCount > start + first;
						return {
							totalCount,
							edges: {
								node
							},
							pageInfo: {
								startCursor: after,
								endCursor,
								hasNext
							}
						};
					},
					type: createConnectionType(schemaGenerator, objectTypeInterfaceSearch)
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
	//log.debug(`authorization:${toStr(authorization)}`);
	const prefix = 'Explorer-Api-Key ';
	if(!authorization) {
		log.error(`Authorization header missing!`);
		return { status: 401 }; // Unauthorized
	}
	if(!authorization.startsWith(prefix)) {
		log.error(`Invalid Authorization header:${authorization}!`);
		return { status: 401 }; // Unauthorized
	}
	const apiKey = authorization.substring(prefix.length);
	//log.debug(`apiKey:${toStr(apiKey)}`);
	if (!apiKey) {
		log.error(`ApiKey not found in Authorization header:${authorization}!`);
		return { status: 401 }; // Unauthorized
	}
	if (!interfaceName) {
		log.error(`interfaceName not provided!`);
		return 404; // Not Found
	}
	const hashedApiKey = hash(apiKey);
	//log.debug(`hashedApiKey:${toStr(hashedApiKey)}`);

	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const matchingApiKeys = explorerRepoReadConnection.query({
		count: -1,
		filters: {
			boolean: {
				must: [{
					hasValue: {
						field: 'key',
						values: [hashedApiKey]
					}
				},{
					hasValue: {
						field: '_nodetype',
						values: [NT_API_KEY]
					}
				}]
			}
		}
	});
	//log.debug(`matchingApiKeys:${toStr(matchingApiKeys)}`);
	if(matchingApiKeys.total !== 1) {
		log.error(`API key hashedApiKey:${hashedApiKey} not found!`);
		return {
			body: {
				//message: 'Bad Request'
				message: 'Unauthorized'
			},
			contentType: 'text/json;charset=utf-8',
			//status: 400 // Bad Request
			status: 401 // Unauthorized
		};
	}
	const apiKeyNode = explorerRepoReadConnection.get(matchingApiKeys.hits[0].id);
	//log.debug(`apiKeyNode:${toStr(apiKeyNode)}`);
	let {interfaces = []} = apiKeyNode;
	if (!Array.isArray(interfaces)) { interfaces = [interfaces]; }
	//log.debug(`interfaces:${toStr(interfaces)}`);
	if (!interfaces.includes(interfaceName)) {
		log.error(`API key hashedApiKey:${hashedApiKey} doesn't have read access to interface:${interfaceName}!`);
		return {
			body: {
				//message: 'Bad Request'
				message: 'Unauthorized'
			},
			contentType: 'text/json;charset=utf-8',
			//status: 400 // Bad Request
			status: 401 // Unauthorized
		};
	}

	//log.debug(`interfaceName:${toStr(interfaceName)}`);
	if (!interfaceExists({
		connection: explorerRepoReadConnection,
		name: interfaceName
	})) {
		log.error(`interface:${interfaceName} doesn't exist!`);
		return 404; // Not Found
	}

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
      name: "nameIsUniqueOnSameLevel",
      terms: {
        field: title
        order: "_term ASC"
        size: 10
        minDocCount: 0
      }
      subAggregations: {
      	name: "nameIsNotUniqueOnDifferentLevels",
      	terms: {
        	field: uri
        	order: "_term ASC"
        	size: 10
        	minDocCount: 0
      	}
      } # subAggregations
    }, {
      	name: "nameIsNotUniqueOnDifferentLevels",
      	terms: {
        	field: uri
        	order: "_term ASC"
        	size: 10
        	minDocCount: 0
      	}
      }] # aggregations
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
        subAggregations {
          name
          buckets {
            docCount
            key
          }
        }
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

{
  getSearchConnection(
    #after: 0
    #aggregations: [{
    #  name: "myTitleAggregation",
    #  terms: {
    #    field: "title"
    #    order: "_term ASC"
    #    size: 10
    #    minDocCount: 0
    #  }
    #},{
    #  name: "myUriAggregation",
    #  terms: {
    #    field: "uri"
    #    order: "_term ASC"
    #    size: 10
    #    minDocCount: 0
    #  }
    #}]
    #filters
    first: 10
    #highlight: {
      #encoder: html
    #  fragmenter: simple
    #  fragmentSize: 255
    #  noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
    #  numberOfFragments: 1
      #order: none
    #  postTag: "</b>"
    #  preTag: "<b>"
    #  requireFieldMatch: false
      #tagsSchema: styled
    #  properties: {
    #    title: {
          #fragmenter: simple
          #noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
          #numberOfFragments: 1
          #order: none
          #requireFieldMatch: false
     #   }
     #   text: {
     #     fragmenter: span
     # 		fragmentSize: 50
      		#noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
     # 		numberOfFragments: 2
     # 		order: score
      		#postTag: "</b>"
      		#preTag: "<b>"
      		#requireFieldMatch: false
     #   }
     #   uri: {
          #fragmenter: simple
          #noMatchSize: 255 # This returns many fields like title._stemmed_en, but since I don't expose it, who cares?
          #numberOfFragments: 1
          #order: none
          #requireFieldMatch: false
     #   }
     # }
    #}
    searchString: "domain"
  ) {
    totalCount
    edges {
      node {
        aggregations {
      		name
      		buckets {
        		docCount
        		key
      		}
        } # aggregations
		count
		hits {
	  		_highlight {
	    		title
	    		text
	    		uri
	      	} # _highlight
	  		_json
	  		_score
	  		title
	  		text
	  		uri
    	} # hits
	    total
      } # node
    } # edges
    pageInfo {
      startCursor
      endCursor
      hasNext
    } #pageInfo
  } #getSearchConnection
}
*/
