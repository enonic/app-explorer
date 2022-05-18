import {INDEX_CONFIG_N_GRAM} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';
import {coerceFieldType} from '/lib/explorer/field/coerceFieldType';
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
		} :{
			args :{
				key :string
				decideByType ?:boolean
				enabled ?:boolean
				description ?:string
				fieldType ?:string
				fulltext ?:boolean
				includeInAllText ?:boolean
				//indexConfig,
				max ?:number
				min ?:number
				nGram ?:boolean
				path ?:boolean
			}
		}) {
			return coerceFieldType(createField(args));
		},
		type: glue.getObjectType(GQL_TYPE_FIELD_NODE_NAME)
	};
}
