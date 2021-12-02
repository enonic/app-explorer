import {
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {GQL_INPUT_TYPE_FILTER_IDS} from '../constants';


export function addStaticInputTypes(glue) {
	glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_IDS,
		fields: {
			values: { type: nonNull(list(GraphQLString)) }
		}
	});
}
