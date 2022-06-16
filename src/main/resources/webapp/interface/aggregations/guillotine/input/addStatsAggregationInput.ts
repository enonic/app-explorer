import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INPUT_TYPE_AGGREGATION_STATS} from '../constants';


export function addStatsAggregationInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_STATS,
		description: 'Stats aggregation input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			}
		}
	});
}
