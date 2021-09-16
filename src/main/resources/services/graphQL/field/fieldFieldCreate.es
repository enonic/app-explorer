import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	nonNull
} from '/lib/graphql';

import {
	GQL_TYPE_FIELD_NODE,
	coerseFieldType
} from './types';

import {createField} from './createField';


export const fieldFieldCreate = {
	args: {
		key: nonNull(GraphQLString),

		decideByType: GraphQLBoolean,
		enabled: GraphQLBoolean,
		description: GraphQLString,
		fieldType: GraphQLString,
		fulltext: GraphQLBoolean,
		includeInAllText: GraphQLBoolean,
		//indexConfig,
		instruction: GraphQLString,
		max: GraphQLInt,
		min: GraphQLInt,
		nGram: GraphQLBoolean,
		path: GraphQLBoolean
	},
	resolve({
		args
	}) {
		return coerseFieldType(createField(args));
	},
	type: GQL_TYPE_FIELD_NODE
}; // fieldFieldCreate
