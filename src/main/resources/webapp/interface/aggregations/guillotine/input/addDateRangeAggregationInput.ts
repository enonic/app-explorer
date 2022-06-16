import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_AGGREGATION_DATE_RANGE,
	GQL_INPUT_TYPE_DATE_RANGE
} from '../constants';


export function addDateRangeAggregationInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_AGGREGATION_DATE_RANGE,
		description: 'DateRange aggregation input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			},
			format: {
				type: GraphQLString
			},
			ranges: {
				type: glue.getInputType(GQL_INPUT_TYPE_DATE_RANGE)
			}
		}
	});
}
