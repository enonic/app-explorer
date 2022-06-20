import type {GraphQL} from '../../../index.d';
import type {Glue} from '../../../utils/Glue';


import {
	GraphQLInt,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INPUT_TYPE_AGGREGATION_TERMS} from '../constants';


export function addTermsAggregationInput({
	fieldType = GraphQLString, // What guillotine uses
	glue
} :{
	fieldType ?:GraphQL.ArgsType
	glue :Glue
}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_TERMS,
		description: 'Terms aggregation input type',
		fields: {
			field: {
				type: nonNull(fieldType)
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
