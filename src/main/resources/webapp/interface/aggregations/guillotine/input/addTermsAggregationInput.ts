import type {Glue} from '../../../utils/Glue';


import {
	GraphQLInt,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INPUT_TYPE_AGGREGATION_TERMS} from '../constants';


export function addTermsAggregationInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_TERMS,
		description: 'Terms aggregation input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			},
			order: {
				type: GraphQLString
			},
			size: {
				type: GraphQLInt
			},
			minDocCount: {
				type: GraphQLInt
			}
		}
	});
}
