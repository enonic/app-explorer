import type {Glue} from '../../../utils/Glue';


import {
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INPUT_TYPE_FILTER_NOT_EXISTS} from '../constants';


export function addNotExistsFilterInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_NOT_EXISTS,
		description: 'NotExistsFilter input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			}
		}
	});
}
