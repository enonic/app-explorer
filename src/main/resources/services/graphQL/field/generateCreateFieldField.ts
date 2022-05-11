import {INDEX_CONFIG_N_GRAM} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {coerseFieldType} from '/lib/explorer/field/coerseFieldType';
import {createField} from '/lib/explorer/field/createField';

import {GQL_TYPE_FIELD_NODE_NAME} from '../constants';


export function generateCreateFieldField({
	glue
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
			max: GraphQLInt,
			min: GraphQLInt,
			[INDEX_CONFIG_N_GRAM]: GraphQLBoolean,
			path: GraphQLBoolean
		},
		resolve({
			args
		}) {
			return coerseFieldType(createField(args));
		},
		type: glue.getObjectType(GQL_TYPE_FIELD_NODE_NAME)
	};
}
