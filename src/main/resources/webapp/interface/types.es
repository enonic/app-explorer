import {
	toStr
} from '@enonic/js-utils';
import {
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull,
	reference
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
} from './constants';



export function generateTypes(glue) {
	const OBJECT_TYPE_AGGREGATION_COUNT = glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_COUNT_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			field: { type: nonNull(GraphQLString) }
		}
	});

	const OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM = glue.addObjectType({
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

	const OBJECT_TYPE_AGGREGATION_DATE_RANGE = glue.addObjectType({
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

	const OBJECT_TYPE_AGGREGATION_GEO_DISTANCE = glue.addObjectType({
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

	const OBJECT_TYPE_AGGREGATION_MAX = glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_MAX_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			field: { type: nonNull(GraphQLString) }
		}
	});

	const OBJECT_TYPE_AGGREGATION_MIN = glue.addObjectType({
		name: GQL_OBJECT_TYPE_AGGREGATION_MIN_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			field: { type: nonNull(GraphQLString) }
		}
	});

	const OBJECT_TYPE_AGGREGATION_RANGE = glue.addObjectType({
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

	const OBJECT_TYPE_AGGREGATION_STATS = glue.addObjectType({
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

	const OBJECT_TYPE_AGGREGATION_TERMS = glue.addObjectType({
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

	return {
		OBJECT_TYPE_AGGREGATIONS_UNION: glue.addUnionType({
			name: GQL_OBJECT_TYPE_AGGREGATIONS_UNION_NAME,
			typeResolver(source) {
				//log.debug(`source ${toStr(source)}`, source);
				switch (source.type) {
				case GQL_OBJECT_TYPE_AGGREGATION_COUNT_NAME: return OBJECT_TYPE_AGGREGATION_COUNT;
				case GQL_OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM_NAME: return OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM;
				case GQL_OBJECT_TYPE_AGGREGATION_DATE_RANGE_NAME: return OBJECT_TYPE_AGGREGATION_DATE_RANGE;
				case GQL_OBJECT_TYPE_AGGREGATION_GEO_DISTANCE_NAME: return OBJECT_TYPE_AGGREGATION_GEO_DISTANCE;
				case GQL_OBJECT_TYPE_AGGREGATION_MAX_NAME: return OBJECT_TYPE_AGGREGATION_MAX;
				case GQL_OBJECT_TYPE_AGGREGATION_MIN_NAME: return OBJECT_TYPE_AGGREGATION_MIN;
				case GQL_OBJECT_TYPE_AGGREGATION_RANGE_NAME: return OBJECT_TYPE_AGGREGATION_RANGE;
				case GQL_OBJECT_TYPE_AGGREGATION_STATS_NAME: return OBJECT_TYPE_AGGREGATION_STATS;
				case GQL_OBJECT_TYPE_AGGREGATION_TERMS_NAME: return OBJECT_TYPE_AGGREGATION_TERMS;
				default:
					throw new Error(`Unknown source.type:${source.type}in source:${toStr(source)}`);
				}
			},
			types: [
				OBJECT_TYPE_AGGREGATION_COUNT,
				OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM,
				OBJECT_TYPE_AGGREGATION_DATE_RANGE,
				OBJECT_TYPE_AGGREGATION_GEO_DISTANCE,
				OBJECT_TYPE_AGGREGATION_MIN,
				OBJECT_TYPE_AGGREGATION_MAX,
				OBJECT_TYPE_AGGREGATION_RANGE,
				OBJECT_TYPE_AGGREGATION_STATS,
				OBJECT_TYPE_AGGREGATION_TERMS
			]
		}).type
	};
} // generateTypes
