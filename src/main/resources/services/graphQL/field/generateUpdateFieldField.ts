import {INDEX_CONFIG_N_GRAM} from '@enonic/js-utils';

import {coerseFieldType} from '/lib/explorer/field/coerseFieldType';
import {updateField} from '/lib/explorer/field/updateField';
import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString
} from '/lib/graphql';

import {GQL_TYPE_FIELD_NODE_NAME} from '../constants';


export function generateUpdateFieldField({
	glue
}) {
	return {
		args: {
			_id: glue.getScalarType('_id'),

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
			return coerseFieldType(updateField(args));
		},
		type: glue.getObjectType(GQL_TYPE_FIELD_NODE_NAME)
	};
}
