import type {GraphQL} from '../../../index.d';
import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INPUT_TYPE_AGGREGATION_MIN} from '../constants';


export function addMinAggregationInput({
	fieldType = GraphQLString, // What guillotine uses
	glue
} :{
	fieldType ?:GraphQL.ArgsType
	glue :Glue
}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_MIN,
		description: 'MinAggregation input type',
		fields: {
			field: {
				type: nonNull(fieldType)
			}
		}
	});
}
