import type { Glue } from '../Glue';

import { toStr } from '@enonic/js-utils/value/toStr';
import {
	// GraphQLBoolean,
	GraphQLString,
	Json as GraphQLJson,
	list,
	nonNull,
	// @ts-ignore
} from '/lib/graphql';
import {
	listSchemas,
} from '/lib/xp/schema';
import { GQL_UNIQ_TYPE } from '../constants';

const TRACE = false;

type SchemaType = 'CONTENT_TYPE' | 'MIXIN' | 'XDATA';

export interface ListSchemasArgs {
	application: string;
	type: SchemaType;
}

export interface ListSchemasEnv {
	args: ListSchemasArgs
}

export function listSchemasResolver(
	env: ListSchemasEnv
) {
	if (TRACE) log.info('%s env:%s', GQL_UNIQ_TYPE.QUERY_SCHEMA_LIST, toStr(env));
	const {
		args: {
			application,
			type,
		}
	} = env;
	const schemaList = listSchemas({
		application,
		type
	});
	if (TRACE) log.info('%s schemaList:%s', GQL_UNIQ_TYPE.QUERY_SCHEMA_LIST, toStr(schemaList));
	return schemaList;
}

export function addListSchemas({
	glue
}: {
	glue: Glue
}) {
	glue.addEnumType({
		name: GQL_UNIQ_TYPE.ENUM_SCHEMA_TYPE,
		values: [
			'CONTENT_TYPE',
			'MIXIN',
			'XDATA'
		]
	});

	glue.addObjectType({
		name: GQL_UNIQ_TYPE.OBJECT_SCHEMA_CONTENT,
		fields: {
			name: { type: GraphQLString },
			displayName: { type: GraphQLString },
			description: { type: GraphQLString },
			modifiedTime: { type: GraphQLString },
			resource: { type: GraphQLString },
			type: { type: GraphQLString },
			form: { type: list(GraphQLJson) },
			config: { type: GraphQLJson },
		}
	});

	glue.addQuery<{
		application: string;
		type: SchemaType;
	}>({
		args: {
			application: nonNull(GraphQLString),
			type: nonNull(glue.getEnumType(GQL_UNIQ_TYPE.ENUM_SCHEMA_TYPE)),
		},
		name: GQL_UNIQ_TYPE.QUERY_SCHEMA_LIST,
		resolve: listSchemasResolver,
		type: list(glue.getObjectType(GQL_UNIQ_TYPE.OBJECT_SCHEMA_CONTENT)),
	});
};
