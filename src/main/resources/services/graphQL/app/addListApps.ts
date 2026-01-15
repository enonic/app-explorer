import type { Glue } from '../Glue';

import { includes } from '@enonic/js-utils/array';
import { toStr } from '@enonic/js-utils/value/toStr';
import {
	GraphQLString,
	list,
	// @ts-ignore
} from '/lib/graphql';
import {
	list as listApps
} from '/lib/xp/app';
import { GQL_UNIQ_TYPE } from '../constants';

const TRACE = false;

export function addListApps({
	glue
}: {
	glue: Glue
}) {
	glue.addQuery<{
		keys: string[];
	}>({
		args: {
			keys: list(GraphQLString)
		},
		name: GQL_UNIQ_TYPE.QUERY_APP_LIST,
		resolve: (env) => {
			if (TRACE) log.info('%s env:%s', GQL_UNIQ_TYPE.QUERY_APP_LIST, toStr(env));
			const {
				args: {
					keys: filterOnKeys
				}
			} = env;
			let appList = listApps();
			if (filterOnKeys.length) {
				appList = appList.filter(({key}) => includes(filterOnKeys, key))
			}
			if (TRACE) log.info('%s appList:%s', GQL_UNIQ_TYPE.QUERY_APP_LIST, toStr(appList));
			return appList;
		},
		type: list(glue.getObjectType(GQL_UNIQ_TYPE.OBJECT_APPLICATION)),
	});
};
