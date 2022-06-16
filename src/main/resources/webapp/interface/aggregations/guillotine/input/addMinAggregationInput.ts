import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INPUT_TYPE_AGGREGATION_MIN} from '../constants';


export function addMinAggregationInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_MIN,
		description: 'MinAggregation input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			}
		}
	});
}
