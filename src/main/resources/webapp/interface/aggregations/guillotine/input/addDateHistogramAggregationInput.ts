import type {GraphQL} from '../../../index.d';
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


export function addDateHistogramAggregationInput({
	fieldType = GraphQLString, // What guillotine uses
	glue
} :{
	fieldType ?:GraphQL.ArgsType
	glue :Glue
}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_GEO_DISTANCE,
		description: 'DateHistogram aggregation input type',
		fields: {
			field: {
				type: nonNull(fieldType)
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
