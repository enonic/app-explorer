import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString
} from '/lib/graphql';

import {
	GQL_TYPE_ID
} from '../types';

import {
	GQL_TYPE_FIELD_NODE,
	coerseFieldType
} from './types';

import {updateField} from './updateField';


export const fieldFieldUpdate = {
	args: {
		_id: GQL_TYPE_ID,

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
		return coerseFieldType(updateField(args));
	},
	type: GQL_TYPE_FIELD_NODE
};
