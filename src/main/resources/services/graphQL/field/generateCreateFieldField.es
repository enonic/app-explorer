import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	nonNull
} from '/lib/graphql';

import {coerseFieldType} from '/lib/explorer/field/coerseFieldType';
import {createField} from '/lib/explorer/field/createField';


export function generateCreateFieldField({
	GQL_TYPE_FIELD_NODE
}) {
	return {
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
	};
}
