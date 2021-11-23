import {
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull,
	reference
} from '/lib/graphql';

import {
	GQL_ENUM_AGGREGATION_GEO_DISTANCE_UNITS,
	GQL_ENUM_FIELD_KEYS_FOR_AGGREGATIONS,
	GQL_ENUM_FIELD_KEYS_FOR_FILTERS,
	GQL_INPUT_TYPE_AGGREGATION,
	GQL_INPUT_TYPE_AGGREGATION_COUNT,
	GQL_INPUT_TYPE_AGGREGATION_DATE_RANGE,
	GQL_INPUT_TYPE_AGGREGATION_DATE_RANGE_RANGE,
	GQL_INPUT_TYPE_AGGREGATION_DATE_HISTOGRAM,
	GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE,
	GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE_ORIGIN,
	GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE_RANGES,
	GQL_INPUT_TYPE_AGGREGATION_MAX,
	GQL_INPUT_TYPE_AGGREGATION_MIN,
	GQL_INPUT_TYPE_AGGREGATION_RANGE,
	GQL_INPUT_TYPE_AGGREGATION_RANGE_RANGE,
	GQL_INPUT_TYPE_AGGREGATION_STATS,
	GQL_INPUT_TYPE_AGGREGATION_TERMS,
	GQL_INPUT_TYPE_FILTER_BOOLEAN_MUST,
	GQL_INPUT_TYPE_FILTER_BOOLEAN_MUST_NOT,
	GQL_INPUT_TYPE_FILTER_BOOLEAN_SHOULD,
	GQL_INPUT_TYPE_FILTER_EXISTS_WITH_DYNAMIC_FIELDS,
	GQL_INPUT_TYPE_FILTER_IDS,
	GQL_INPUT_TYPE_FILTER_HAS_VALUE_WITH_DYNAMIC_FIELDS,
	GQL_INPUT_TYPE_FILTER_NOT_EXISTS_WITH_DYNAMIC_FIELDS,
	GQL_INPUT_TYPE_FILTERS,
	GQL_INPUT_TYPE_HIGHLIGHT,
	GQL_INPUT_TYPE_HIGHLIGHT_PROPERTIES,
	GQL_INPUT_TYPE_SUB_AGGREGATION
} from './constants';


export function addDynamicInputTypes({
	glue,
	highlightParameterPropertiesFields,
	staticHighlightParameterFields
}) {
	const enumFieldsKeysForFilters = glue.getEnumType(GQL_ENUM_FIELD_KEYS_FOR_FILTERS);

	const graphqlInputTypeFilterExistsWithDynamicFields = glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_EXISTS_WITH_DYNAMIC_FIELDS,
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForFilters)
			}
		}
	});

	const graphqlInputTypeFilterHasValueWithDynamicFields = glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_HAS_VALUE_WITH_DYNAMIC_FIELDS,
		fields: {
			field: { type: nonNull(enumFieldsKeysForFilters) },
			values: { type: nonNull(list(GraphQLString)) }
		}
	});

	const graphqlInputTypeFilterNotExistsWithDynamicFields = glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_NOT_EXISTS_WITH_DYNAMIC_FIELDS,
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForFilters)
			}
		}
	});

	const GRAPHQL_INPUT_TYPE_FILTER_IDS = glue.getInputType(GQL_INPUT_TYPE_FILTER_IDS);

	const graphqlInputTypeFilterBooleanDynamicFields = {
		exists: { type: graphqlInputTypeFilterExistsWithDynamicFields },
		hasValue: { type: graphqlInputTypeFilterHasValueWithDynamicFields },
		ids: { type: GRAPHQL_INPUT_TYPE_FILTER_IDS },
		notExists: { type: graphqlInputTypeFilterNotExistsWithDynamicFields }
	};

	const graphqlInputTypeFilterBooleanMust = glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_BOOLEAN_MUST,
		fields: graphqlInputTypeFilterBooleanDynamicFields
	});

	const graphqlInputTypeFilterBooleanMustNot = glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_BOOLEAN_MUST_NOT,
		fields: graphqlInputTypeFilterBooleanDynamicFields
	});

	const graphqlInputTypeFilterBooleanMustShould =glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_BOOLEAN_SHOULD,
		fields: graphqlInputTypeFilterBooleanDynamicFields
	});

	const graphqlInputTypeFilterBooleanWithDynamicFields = glue.addInputType({
		name: 'InputTypeFilterBooleanWithDynamicFields',
		fields: {
			must: { type: list(graphqlInputTypeFilterBooleanMust)},
			mustNot: { type: list(graphqlInputTypeFilterBooleanMustNot)},
			should: { type: list(graphqlInputTypeFilterBooleanMustShould)}
		}
	});

	const highlightProperties = glue.addInputType({
		name: GQL_INPUT_TYPE_HIGHLIGHT_PROPERTIES,
		fields: highlightParameterPropertiesFields
	});

	const enumFieldsKeysForAggreations = glue.getEnumType(GQL_ENUM_FIELD_KEYS_FOR_AGGREGATIONS);

	const inputTypeAggregationCount = glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_COUNT,
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForAggreations)
			}
		}
	});
	const inputTypeAggregationDateHistogram = glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_DATE_HISTOGRAM,
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForAggreations)
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
	const inputTypeAggregationDateRange = glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_DATE_RANGE,
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			},
			format: { // yyyy-MM-dd’T’HH:mm:ss.SSSZ
				type: GraphQLString
			},
			ranges: {
				type: list(glue.addInputType({
					name: GQL_INPUT_TYPE_AGGREGATION_DATE_RANGE_RANGE,
					fields: {
						from: { type: GraphQLString },
						to: { type: GraphQLString }
					}
				}))
			}
		}
	});
	const inputTypeAggregationGeoDistance = glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE,
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			},
			origin: {
				type: glue.addInputType({
					name: GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE_ORIGIN,
					fields: {
						lat: { type: GraphQLString },
						lon: { type: GraphQLString }
					}
				})
			},
			ranges: {
				type: list(glue.addInputType({
					name: GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE_RANGES,
					fields: {
						from: { type: GraphQLFloat },
						to: { type: GraphQLFloat }
					}
				}))
			},
			unit: {
				type: nonNull(glue.getEnumType(GQL_ENUM_AGGREGATION_GEO_DISTANCE_UNITS))
			}
		}
	});
	const inputTypeAggregationMax = glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_MAX,
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			}
		}
	});
	const inputTypeAggregationMin = glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_MIN,
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			}
		}
	});
	const inputTypeAggregationRange = glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_RANGE,
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			},
			ranges: {
				type: list(glue.addInputType({
					name: GQL_INPUT_TYPE_AGGREGATION_RANGE_RANGE,
					fields: {
						from: { type: GraphQLFloat },
						to: { type: GraphQLFloat }
					}
				}))
			}
		}
	});
	const inputTypeAggregationStats = glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_STATS,
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
			}
		}
	});
	const inputTypeAggregationTerms = glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_TERMS,
		fields: {
			field: {
				//type: nonNull(GraphQLString)
				type: nonNull(enumFieldsKeysForAggreations)
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

	glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION,
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
				type: list(glue.addInputType({
					name: GQL_INPUT_TYPE_SUB_AGGREGATION,
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
							type: list(reference(GQL_INPUT_TYPE_SUB_AGGREGATION))
						}
					} // fields
				}))
			}
		} // fields
	});

	glue.addInputType({
		name: GQL_INPUT_TYPE_FILTERS,
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

	glue.addInputType({
		name: GQL_INPUT_TYPE_HIGHLIGHT,
		fields: {
			...staticHighlightParameterFields,
			properties: { type: highlightProperties }
		}
	});
}
