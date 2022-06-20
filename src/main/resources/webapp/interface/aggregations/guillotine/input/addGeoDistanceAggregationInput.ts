import type {GraphQL} from '../../../index.d';
import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_AGGREGATION_DATE_HISTORGAM,
	GQL_INPUT_TYPE_GEO_POINT,
	GQL_INPUT_TYPE_NUMBER_RANGE
} from '../constants';


export function addGeoDistanceAggregationInput({
	fieldType = GraphQLString, // What guillotine uses
	glue
} :{
	fieldType ?:GraphQL.ArgsType
	glue :Glue
}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_DATE_HISTORGAM,
		description: 'GeoDistance aggregation input type',
		fields: {
			field: {
				type: nonNull(fieldType)
			},
			unit: {
				type: GraphQLString
			},
			origin: {
				type: glue.getInputType(GQL_INPUT_TYPE_GEO_POINT)
			},
			ranges: {
				type: glue.getInputType(GQL_INPUT_TYPE_NUMBER_RANGE)
			}
		}
	});
}
