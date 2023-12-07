import type { Glue } from '../Glue';


import { startsWith } from '@enonic/js-utils/string/startsWith';
import {
	Json as GraphQLJSON,
	GraphQLID,
	GraphQLString,
	list,
	nonNull
	// @ts-ignore
} from '/lib/graphql';
import {list as listRepos} from '/lib/xp/repo';
import {
	GQL_OBJECT_TYPE_NAME_REPO,
	GQL_QUERY_NAME_LIST_REPOS
} from '../constants';

export function addListRepos({glue}: {glue: Glue}) {
	return glue.addQuery({
		name: GQL_QUERY_NAME_LIST_REPOS,
		args: {
			id: GraphQLID
		},
		resolve({
			args: {
				id
			}
		}) {
			const explorerRepos = listRepos()
				.filter(({id: _id})=> startsWith(_id, 'com.enonic.app.explorer')); // main, journal and collections
			if (id) {
				return explorerRepos.filter(({id: _id}) => _id === id);
			}
			return explorerRepos;
		},
		type: list(glue.addObjectType({
			name: GQL_OBJECT_TYPE_NAME_REPO,
			fields: {
				id: { type: nonNull(GraphQLString) },
				branches: { type: nonNull(list(GraphQLString)) },
				settings: { type: GraphQLJSON }
			}
		}))
	});
}
