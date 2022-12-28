import type { OneOrMore } from '/lib/explorer/types/index.d';
import type {
	// Group,
	Principal,
	// Role,
	User,
	UserKey,
} from '/lib/xp/auth';
import type {
	Glue,
	ObjectType,
	UnionType,
} from '../Glue';


import {
	GraphQLBoolean,
	GraphQLString,
	nonNull,
	// @ts-ignore
} from '/lib/graphql';
import {getUser} from '/lib/xp/auth';
import {
	// GQL_QUERY_MEMBERSHIPS_GET_NAME,
	GQL_QUERY_USER_GET_NAME,
	GQL_TYPE_USER_NAME,
} from '../constants';
import addGetMemberships from './addGetMemberships'


type ExtendedUser = User & {
	// memberships: (ObjectType<Principal>|UnionType<Principal>)[]
	memberships: OneOrMore<ObjectType<Principal>|UnionType<Principal>>
}


function addGetUser({
	glue
}: {
	glue: Glue
}) {
	const {
		// args: membershipsArgs,
		resolve: membershipsResolver,
		type: membershipsType
	} = addGetMemberships({glue})
	return glue.addQuery({
		args: {},
		name: GQL_QUERY_USER_GET_NAME,
		resolve() {
			return getUser();
		},
		type: glue.addObjectType<ExtendedUser>({
			name: GQL_TYPE_USER_NAME,
			fields: {
				disabled: { type: GraphQLBoolean },
				displayName: { type: nonNull(GraphQLString) },
				email: { type: GraphQLString },
				idProvider: { type: nonNull(GraphQLString) },
				key: { type: nonNull(GraphQLString) },
				login: { type: nonNull(GraphQLString) },
				memberships: {
					resolve({
						source: {
							key
						}
					}: {
						source: {
							key: UserKey
						}
					}) {
						return membershipsResolver({
							args: {
								principalKey: key
							}
						});
					},
					type: membershipsType
				},
				modifiedTime: { type: GraphQLString },
				type: { type: nonNull(GraphQLString) },
			}
		})
	});
}


export default addGetUser
