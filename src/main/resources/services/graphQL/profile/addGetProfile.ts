// import type {AnyObject} from '/lib/explorer/types/index.d';
import type {Glue} from '../Glue';

// import {toStr} from '@enonic/js-utils';
import {
	Json as GraphQLJson
	//@ts-ignore
} from '/lib/graphql';
import {
	getProfile,
	getUser
} from '/lib/xp/auth';
import {GQL_QUERY_PROFILE_GET_NAME} from '../constants';


export function addGetProfile({
	glue
}: {
	glue: Glue
}) {
	return glue.addQuery({
		args: {},
		name: GQL_QUERY_PROFILE_GET_NAME,
		resolve(/*_env*/) {
			const user = getUser();
			// log.info('user:%s', toStr(user));

			const {key} = user;
			// log.info('user key:%s', toStr(key));

			// const fullProfile = getProfile({
			// 	key
			// });
			// log.info('fullProfile:%s', toStr(fullProfile));

			const explorerProfile = getProfile({
				key,
				scope: app.name
			});
			// log.info('explorerProfile:%s', toStr(explorerProfile)); // can be null
			return explorerProfile;
		},
		type: GraphQLJson
	});
}
