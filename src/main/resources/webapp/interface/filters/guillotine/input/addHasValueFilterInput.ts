import type {Glue} from '../../../utils/Glue';


import {
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {GQL_INPUT_TYPE_FILTER_HAS_VALUE} from '../constants';


export function addHasValueFilterInput({glue} :{glue :Glue}) {
	return glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_HAS_VALUE,
		description: 'HasValueFilter input type',
		fields: {
			field: {
				type: nonNull(GraphQLString)
			},
			stringValues: {
				type: list(GraphQLString)
			},
			intValues: {
				type: list(GraphQLInt)
			},
			floatValues: {
				type: list(GraphQLFloat)
			},
			booleanValues: {
				type: list(GraphQLBoolean)
			}
		}
	});
}
