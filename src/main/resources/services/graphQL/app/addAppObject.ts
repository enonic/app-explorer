

import type { Glue } from '../Glue';

// import { toStr } from '@enonic/js-utils/value/toStr';
import {
	GraphQLBoolean,
	GraphQLString,
	list,
	nonNull,
	// @ts-ignore
} from '/lib/graphql';
import {
	type Application,
} from '/lib/xp/app';
import { GQL_UNIQ_TYPE } from '../constants';
import {
	type ListSchemasArgs,
	listSchemasResolver,
} from '../schema/addListSchemas';

const TRACE = false;

export function addAppObject({
	glue
}: {
	glue: Glue
}) {
	glue.addObjectType({
		name: GQL_UNIQ_TYPE.OBJECT_APPLICATION,
		fields: {
			key: { type: nonNull(GraphQLString) },
			displayName: { type: GraphQLString },
			vendorName: { type: GraphQLString },
			vendorUrl: { type: GraphQLString },
			url: { type: GraphQLString },
			version: { type: GraphQLString },
			systemVersion: { type: GraphQLString },
			minSystemVersion: { type: GraphQLString },
			maxSystemVersion: { type: GraphQLString },
			modifiedTime: { type: GraphQLString },
			started: { type: GraphQLBoolean },
			system: { type: GraphQLBoolean },
			[GQL_UNIQ_TYPE.QUERY_SCHEMA_LIST]: {
				args: {
					type: nonNull(glue.getEnumType(GQL_UNIQ_TYPE.ENUM_SCHEMA_TYPE)),
				},
				// @ts-expect-error
				resolve: (env: {
					args: ListSchemasArgs;
					source: Application;
				}) => {
					env.args.application = env.source.key;
					return listSchemasResolver(env);
				},
				type: list(glue.getObjectType(GQL_UNIQ_TYPE.OBJECT_SCHEMA_CONTENT))
			}
		}
	});
};
