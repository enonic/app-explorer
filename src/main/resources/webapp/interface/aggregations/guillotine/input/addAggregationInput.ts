import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	list,
	reference
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_AGGREGATION//,
	//GQL_INPUT_TYPE_AGGREGATION_RANGE,
	//GQL_INPUT_TYPE_AGGREGATION_DATE_HISTORGAM,
	//GQL_INPUT_TYPE_AGGREGATION_DATE_RANGE,
	//GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE,
	//GQL_INPUT_TYPE_AGGREGATION_MAX,
	//GQL_INPUT_TYPE_AGGREGATION_MIN,
	//GQL_INPUT_TYPE_AGGREGATION_STATS,
	//GQL_INPUT_TYPE_AGGREGATION_TERMS,
	//GQL_INPUT_TYPE_AGGREGATION_VALUE_COUNT
} from '../constants';
import {addDateHistogramAggregationInput} from './addDateHistogramAggregationInput';
import {addDateRangeAggregationInput} from './addDateRangeAggregationInput';
import {addDateRangeInput} from './addDateRangeInput';
import {addGeoDistanceAggregationInput} from './addGeoDistanceAggregationInput';
import {addGeoPointInput} from './addGeoPointInput';
import {addMaxAggregationInput} from './addMaxAggregationInput';
import {addMinAggregationInput} from './addMinAggregationInput';
import {addNumberRangeInput} from './addNumberRangeInput';
import {addRangeAggregationInput} from './addRangeAggregationInput';
import {addStatsAggregationInput} from './addStatsAggregationInput';
import {addTermsAggregationInput} from './addTermsAggregationInput';
import {addValueCountAggregationInput} from './addValueCountAggregationInput';


export function addAggregationInput({glue} :{glue :Glue}) {
	addDateRangeInput({glue});
	addGeoPointInput({glue});
	addNumberRangeInput({glue});
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION,
		description: 'Aggregation input type',
		fields: {
			subAggregations: {
				type: list(reference(GQL_INPUT_TYPE_AGGREGATION))
			},
			name: {
				type: GraphQLString
			},
			terms: {
				type: addTermsAggregationInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_AGGREGATION_TERMS)
			},
			stats: {
				type: addStatsAggregationInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_AGGREGATION_STATS)
			},
			range: {
				type: addRangeAggregationInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_AGGREGATION_RANGE)
			},
			dateRange: {
				type: addDateRangeAggregationInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_AGGREGATION_DATE_RANGE)
			},
			dateHistogram: {
				type: addDateHistogramAggregationInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_AGGREGATION_DATE_HISTORGAM)
			},
			geoDistance: {
				type: addGeoDistanceAggregationInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE)
			},
			min: {
				type: addMinAggregationInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_AGGREGATION_MIN)
			},
			max: {
				type: addMaxAggregationInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_AGGREGATION_MAX)
			},
			count: {
				type: addValueCountAggregationInput({glue})
				//type: glue.getInputType(GQL_INPUT_TYPE_AGGREGATION_VALUE_COUNT)
			}
		}
	});
}
