import type {Glue} from '../Glue';


// import {toStr} from '@enonic/js-utils';
import {
	Json as GraphQLJson,
	GraphQLString,
	nonNull,
	//@ts-ignore
} from '/lib/graphql';
import {
	getUser,
	modifyProfile,
} from '/lib/xp/auth';
import {GQL_QUERY_PROFILE_MODIFY_NAME} from '../constants';


export function addModifyProfile({
	glue
}: {
	glue: Glue
}) {
	return glue.addMutation<{
		json: string
	}>({
		args: {
			json: nonNull(GraphQLString)
		},
		name: GQL_QUERY_PROFILE_MODIFY_NAME,
		resolve(env) {
			const {
				args: {
					json
				}
			} = env;

			const obj = JSON.parse(json);
			// log.info('obj:%s', toStr(obj));

			const user = getUser();
			// log.info('user:%s', toStr(user));

			const {key} = user;
			// log.info('user key:%s', toStr(key));

			const modifiedExplorerProfile = modifyProfile({
				key,
				scope: app.name,
				editor: (/*explorerProfile*/) => {
					// log.info('explorerProfile:%s', toStr(explorerProfile));
					// return explorerProfile;
					return obj;
				}
			});
			// log.info('modifiedExplorerProfile:%s', toStr(modifiedExplorerProfile));
			return modifiedExplorerProfile;
		},
		type: GraphQLJson
	});
}
