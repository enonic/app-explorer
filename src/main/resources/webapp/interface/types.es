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
import {schemaGenerator} from './schemaGenerator';


const {
	createObjectType,
	createUnionType
} = schemaGenerator;


export const OBJECT_TYPE_AGGREGATION_COUNT_NAME = 'AggregationCount';
export const OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM_NAME = 'AggregationDateHistogram';
export const OBJECT_TYPE_AGGREGATION_DATE_RANGE_NAME = 'AggregationDateRange';
export const OBJECT_TYPE_AGGREGATION_GEO_DISTANCE_NAME = 'AggregationGeoDistance';
export const OBJECT_TYPE_AGGREGATION_MAX_NAME = 'AggregationMax';
export const OBJECT_TYPE_AGGREGATION_MIN_NAME = 'AggregationMin';
export const OBJECT_TYPE_AGGREGATION_RANGE_NAME = 'AggregationRange';
export const OBJECT_TYPE_AGGREGATION_STATS_NAME = 'AggregationStats';
export const OBJECT_TYPE_AGGREGATION_TERMS_NAME = 'AggregationTerms';
export const OBJECT_TYPE_AGGREGATIONS_UNION_NAME = 'AggregationsUnion';


export const OBJECT_TYPE_AGGREGATION_COUNT = createObjectType({
	name: OBJECT_TYPE_AGGREGATION_COUNT_NAME,
	fields: {
		name: { type: nonNull(GraphQLString) },
		field: { type: nonNull(GraphQLString) }
	}
});

export const OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM = createObjectType({
	name: OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM_NAME,
	fields: {
		buckets: { type: list(createObjectType({ // TODO nonNull?
			name: 'AggregationDateHistogramBuckets',
			fields: {
				docCount: { type: nonNull(GraphQLInt) },
				key: { type: nonNull(GraphQLString) }
			}
		}))},
		name: { type: nonNull(GraphQLString) }
	} // fields
});

export const OBJECT_TYPE_AGGREGATION_DATE_RANGE = createObjectType({
	name: OBJECT_TYPE_AGGREGATION_DATE_RANGE_NAME,
	fields: {
		buckets: { type: list(createObjectType({ // TODO nonNull?
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

export const OBJECT_TYPE_AGGREGATION_GEO_DISTANCE = createObjectType({
	name: OBJECT_TYPE_AGGREGATION_GEO_DISTANCE_NAME,
	fields: {
		buckets: { type: list(createObjectType({ // TODO nonNull?
			name: 'AggregationGeoDistanceBuckets',
			fields: {
				docCount: { type: nonNull(GraphQLInt) },
				key: { type: nonNull(GraphQLString) }
			}
		}))},
		name: { type: nonNull(GraphQLString) }
	} // fields
});

export const OBJECT_TYPE_AGGREGATION_MAX = createObjectType({
	name: OBJECT_TYPE_AGGREGATION_MAX_NAME,
	fields: {
		name: { type: nonNull(GraphQLString) },
		field: { type: nonNull(GraphQLString) }
	}
});

export const OBJECT_TYPE_AGGREGATION_MIN = createObjectType({
	name: OBJECT_TYPE_AGGREGATION_MIN_NAME,
	fields: {
		name: { type: nonNull(GraphQLString) },
		field: { type: nonNull(GraphQLString) }
	}
});

export const OBJECT_TYPE_AGGREGATION_RANGE = createObjectType({
	name: OBJECT_TYPE_AGGREGATION_RANGE_NAME,
	fields: {
		buckets: { type: list(createObjectType({ // TODO nonNull?
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

export const OBJECT_TYPE_AGGREGATION_STATS = createObjectType({
	name: OBJECT_TYPE_AGGREGATION_STATS_NAME,
	fields: {
		avg: { type: GraphQLFloat }, // TODO nonNull?
		count: { type: GraphQLInt }, // TODO nonNull?
		max: { type: GraphQLFloat }, // TODO nonNull?
		min: { type: GraphQLFloat }, // TODO nonNull?
		name: { type: nonNull(GraphQLString) },
		sum: { type: GraphQLFloat } // TODO nonNull?
	} // fields
});

export const OBJECT_TYPE_AGGREGATION_TERMS = createObjectType({
	name: OBJECT_TYPE_AGGREGATION_TERMS_NAME,
	fields: {
		buckets: { type: list(createObjectType({ // TODO nonNull?
			name: 'AggregationTermsBuckets',
			fields: {
				docCount: { type: nonNull(GraphQLInt) },
				key: { type: nonNull(GraphQLString) },
				subAggregations: {
					type: list(reference(OBJECT_TYPE_AGGREGATIONS_UNION_NAME))
					//type: list(reference(OBJECT_TYPE_AGGREGATIONS_SUB_UNION_NAME)) // type AggregationsSubUnion not found in schema
					//type: list(OBJECT_TYPE_AGGREGATIONS_SUB_UNION) // hoisted! // Does not work!!!
				}
			}
		}))},
		name: { type: nonNull(GraphQLString) }
	} // fields
});

export const OBJECT_TYPE_AGGREGATIONS_UNION = createUnionType({
	name: OBJECT_TYPE_AGGREGATIONS_UNION_NAME,
	typeResolver(source) {
		//log.debug(`source ${toStr(source)}`, source);
		switch (source.type) {
		case OBJECT_TYPE_AGGREGATION_COUNT_NAME: return OBJECT_TYPE_AGGREGATION_COUNT;
		case OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM_NAME: return OBJECT_TYPE_AGGREGATION_DATE_HISTOGRAM;
		case OBJECT_TYPE_AGGREGATION_DATE_RANGE_NAME: return OBJECT_TYPE_AGGREGATION_DATE_RANGE;
		case OBJECT_TYPE_AGGREGATION_GEO_DISTANCE_NAME: return OBJECT_TYPE_AGGREGATION_GEO_DISTANCE;
		case OBJECT_TYPE_AGGREGATION_MAX_NAME: return OBJECT_TYPE_AGGREGATION_MAX;
		case OBJECT_TYPE_AGGREGATION_MIN_NAME: return OBJECT_TYPE_AGGREGATION_MIN;
		case OBJECT_TYPE_AGGREGATION_RANGE_NAME: return OBJECT_TYPE_AGGREGATION_RANGE;
		case OBJECT_TYPE_AGGREGATION_STATS_NAME: return OBJECT_TYPE_AGGREGATION_STATS;
		case OBJECT_TYPE_AGGREGATION_TERMS_NAME: return OBJECT_TYPE_AGGREGATION_TERMS;
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
});
