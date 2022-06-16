import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INPUT_TYPE_AGGREGATION_MAX} from '../constants';


export function addMaxAggregationInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_MAX,
		description: 'MaxAggregation input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			}
		}
	});
}
