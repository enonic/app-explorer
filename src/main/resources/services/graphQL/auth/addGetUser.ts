import type {User} from '/lib/xp/auth';
import type {Glue} from '../Glue';


import {
	GraphQLBoolean,
	GraphQLString,
	nonNull,
	// @ts-ignore
} from '/lib/graphql';
import {getUser} from '/lib/xp/auth';
import {
	GQL_QUERY_USER_GET_NAME,
	GQL_TYPE_USER_NAME,
} from '../constants';


function addGetUser({
	glue
}: {
	glue: Glue
}) {
	return glue.addQuery({
		args: {},
		name: GQL_QUERY_USER_GET_NAME,
		resolve() {
			return getUser();
		},
		type: glue.addObjectType<User>({
			name: GQL_TYPE_USER_NAME,
			fields: {
				disabled: { type: GraphQLBoolean },
				displayName: { type: nonNull(GraphQLString) },
				email: { type: GraphQLString },
				idProvider: { type: nonNull(GraphQLString) },
				key: { type: nonNull(GraphQLString) },
				login: { type: nonNull(GraphQLString) },
				modifiedTime: { type: GraphQLString },
				type: { type: nonNull(GraphQLString) },
			}
		})
	});
}


export default addGetUser
