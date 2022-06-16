import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INPUT_TYPE_AGGREGATION_VALUE_COUNT} from '../constants';


export function addValueCountAggregationInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_VALUE_COUNT,
		description: 'ValueCount Aggregation input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			}
		}
	});
}
