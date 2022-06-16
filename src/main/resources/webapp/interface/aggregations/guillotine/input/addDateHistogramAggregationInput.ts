import type {Glue} from '../../../utils/Glue';


import {
	GraphQLInt,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE
} from '../constants';


export function addDateHistogramAggregationInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE,
		description: 'DateHistogram aggregation input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			},
			interval: {
				type: GraphQLString
			},
			format: {
				type: GraphQLString
			},
			minDocCount: {
				type: GraphQLInt
			}
		}
	});
}
