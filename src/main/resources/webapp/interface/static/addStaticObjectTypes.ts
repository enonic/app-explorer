import {
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull,
	reference
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_OBJECT_TYPE_AGGREGATION_COUNT_NAME,
	GQL_OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM_NAME,
	GQL_OBJECT_TYPE_AGGREGATION_DATE_RANGE_NAME,
	GQL_OBJECT_TYPE_AGGREGATION_GEO_DISTANCE_NAME,
	GQL_OBJECT_TYPE_AGGREGATION_MAX_NAME,
	GQL_OBJECT_TYPE_AGGREGATION_MIN_NAME,
	GQL_OBJECT_TYPE_AGGREGATION_RANGE_NAME,
	GQL_OBJECT_TYPE_AGGREGATION_STATS_NAME,
	GQL_OBJECT_TYPE_AGGREGATION_TERMS_NAME,
	GQL_OBJECT_TYPE_AGGREGATIONS_UNION_NAME
} from '../constants';


export function addStaticObjectTypes(glue) {
	glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_COUNT_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			field: { type: nonNull(GraphQLString) }
		}
	});

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM_NAME,
		fields: {
			buckets: { type: list(glue.addObjectType({ // TODO nonNull?
				name: 'AggregationDateHistogramBuckets',
				fields: {
					docCount: { type: nonNull(GraphQLInt) },
					key: { type: nonNull(GraphQLString) }
				}
			}))},
			name: { type: nonNull(GraphQLString) }
		} // fields
	});

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_DATE_RANGE_NAME,
		fields: {
			buckets: { type: list(glue.addObjectType({ // TODO nonNull?
				name: 'AggregationDateRangeBuckets',
				fields: {
					docCount: { type: nonNull(GraphQLInt) },
					from: { type: GraphQLInt },
					key: { type: nonNull(GraphQLString) },
					to: { type: GraphQLInt }
				}
			}))},
			name: { type: nonNull(GraphQLString) }
		} // fields
	});

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_GEO_DISTANCE_NAME,
		fields: {
			buckets: { type: list(glue.addObjectType({ // TODO nonNull?
				name: 'AggregationGeoDistanceBuckets',
				fields: {
					docCount: { type: nonNull(GraphQLInt) },
					key: { type: nonNull(GraphQLString) }
				}
			}))},
			name: { type: nonNull(GraphQLString) }
		} // fields
	});

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_MAX_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			field: { type: nonNull(GraphQLString) }
		}
	});

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_MIN_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			field: { type: nonNull(GraphQLString) }
		}
	});

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_RANGE_NAME,
		fields: {
			buckets: { type: list(glue.addObjectType({ // TODO nonNull?
				name: 'AggregationRangeBuckets',
				fields: {
					docCount: { type: nonNull(GraphQLInt) },
					from: { type: GraphQLInt },
					key: { type: nonNull(GraphQLString) },
					to: { type: GraphQLInt }
				}
			}))},
			name: { type: nonNull(GraphQLString) }
		} // fields
	});

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_STATS_NAME,
		fields: {
			avg: { type: GraphQLFloat }, // TODO nonNull?
			count: { type: GraphQLInt }, // TODO nonNull?
			max: { type: GraphQLFloat }, // TODO nonNull?
			min: { type: GraphQLFloat }, // TODO nonNull?
			name: { type: nonNull(GraphQLString) },
			sum: { type: GraphQLFloat } // TODO nonNull?
		} // fields
	});

	glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_TERMS_NAME,
		fields: {
			buckets: { type: list(glue.addObjectType({ // TODO nonNull?
				name: 'AggregationTermsBuckets',
				fields: {
					docCount: { type: nonNull(GraphQLInt) },
					key: { type: nonNull(GraphQLString) },
					subAggregations: {
						type: list(reference(GQL_OBJECT_TYPE_AGGREGATIONS_UNION_NAME))
						//type: list(reference(OBJECT_TYPE_AGGREGATIONS_SUB_UNION_NAME)) // type AggregationsSubUnion not found in schema
						//type: list(OBJECT_TYPE_AGGREGATIONS_SUB_UNION) // hoisted! // Does not work!!!
					}
				}
			}))},
			name: { type: nonNull(GraphQLString) }
		} // fields
	});
} // generateTypes
