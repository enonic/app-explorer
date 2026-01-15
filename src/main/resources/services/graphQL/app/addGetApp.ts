import type { Glue } from '../Glue';

import { toStr } from '@enonic/js-utils/value/toStr';
import {
	// GraphQLBoolean,
	GraphQLString,
	// list,
	nonNull,
	// @ts-ignore
} from '/lib/graphql';
import { get as getApp } from '/lib/xp/app';
import { GQL_UNIQ_TYPE } from '../constants';

const TRACE = false;

export function addGetApp({
	glue
}: {
	glue: Glue
}) {
	glue.addQuery<{
		key: string;
	}>({
		args: {
			key: nonNull(GraphQLString)
		},
		name: GQL_UNIQ_TYPE.QUERY_APP_GET,
		resolve: (env) => {
			if (TRACE) log.info('%s env:%s', GQL_UNIQ_TYPE.QUERY_APP_GET, toStr(env));
			const {
				args: {
					key
				}
			} = env;
			const app = getApp({ key });
			if (TRACE) log.info('%s app:%s', GQL_UNIQ_TYPE.QUERY_APP_GET, toStr(app));
			return app;
		},
		type: glue.getObjectType(GQL_UNIQ_TYPE.OBJECT_APPLICATION),
	});
};
