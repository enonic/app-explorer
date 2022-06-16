import type {Glue} from '../../../utils/Glue';


//@ts-ignore
import {GraphQLFloat} from '/lib/graphql';
import {GQL_INPUT_TYPE_NUMBER_RANGE} from '../constants';


export function addNumberRangeInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_NUMBER_RANGE,
		description: 'Number range input type',
		fields: {
			from: {
				type: GraphQLFloat
			},
			to: {
				type: GraphQLFloat
			}
		}
	});
}
