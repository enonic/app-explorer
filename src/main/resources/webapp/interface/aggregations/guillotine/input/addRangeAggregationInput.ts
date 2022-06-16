import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_AGGREGATION_RANGE,
	GQL_INPUT_TYPE_NUMBER_RANGE
} from '../constants';


export function addRangeAggregationInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_RANGE,
		description: 'Range aggregation input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			},
			ranges: {
				type: glue.getInputType(GQL_INPUT_TYPE_NUMBER_RANGE)
			}
		}
	});
}
