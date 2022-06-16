import type {Glue} from '../../../utils/Glue';


import {
	list,
	reference
	//@ts-ignore
} from '/lib/graphql';
import {
	GQL_INPUT_TYPE_FILTER,
	GQL_INPUT_TYPE_FILTER_BOOLEAN
} from '../constants';


export function addBooleanFilterInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_BOOLEAN,
		description: 'BooleanFilter input type',
		fields: {
			must: {
				type: list(reference(GQL_INPUT_TYPE_FILTER))
			},
			mustNot: {
				type: list(reference(GQL_INPUT_TYPE_FILTER))
			},
			should: {
				type: list(reference(GQL_INPUT_TYPE_FILTER))
			}
		}
	});
}
