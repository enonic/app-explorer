import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString
} from '/lib/graphql';

import {coerseFieldType} from '/lib/explorer/field/coerseFieldType';
import {updateField} from '/lib/explorer/field/updateField';


export function generateUpdateFieldField({
	GQL_TYPE_ID,
	GQL_TYPE_FIELD_NODE
}) {
	return {
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
}
