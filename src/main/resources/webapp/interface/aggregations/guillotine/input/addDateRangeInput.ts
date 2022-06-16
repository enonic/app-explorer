import type {Glue} from '../../../utils/Glue';


//@ts-ignore
import {GraphQLString} from '/lib/graphql';
import {GQL_INPUT_TYPE_DATE_RANGE} from '../constants';


export function addDateRangeInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_DATE_RANGE,
		description: 'Number range input type',
		fields: {
			from: {
				type: GraphQLString
			},
			to: {
				type: GraphQLString
			}
		}
	});
}
