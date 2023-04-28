import type {AnyObject} from '@enonic-types/lib-explorer';
import type {Glue} from '../Glue';


import {toStr} from '@enonic/js-utils';
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
		object: AnyObject
		scope?: string
	}>({
		args: {
			object: nonNull(GraphQLJson),
			scope: GraphQLString
		},
		name: GQL_QUERY_PROFILE_MODIFY_NAME,
		resolve(env) {
			const {
				args: {
					object,
					scope
				}
			} = env;
			// log.info('object:%s', toStr(object));

			const user = getUser();
			// log.info('user:%s', toStr(user));

			const {key} = user;
			// log.info('user key:%s', toStr(key));

			const fullScope = scope ? `${app.name}.${scope}` : app.name;
			// log.info('fullScope:%s', fullScope);

			const modifiedExplorerProfile = modifyProfile({
				key,
				scope: fullScope,
				editor: (/*explorerProfile*/) => {
					// log.info('explorerProfile:%s', toStr(explorerProfile));
					// return explorerProfile;
					return object;
				}
			});
			// log.info('modifiedExplorerProfile:%s', toStr(modifiedExplorerProfile));
			return modifiedExplorerProfile;
		},
		type: GraphQLJson
	});
}
