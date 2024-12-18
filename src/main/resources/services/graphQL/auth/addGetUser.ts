import type { OneOrMore } from '@enonic-types/lib-explorer';
import type {
	User,
	UserKey,
} from '/lib/xp/auth';
import type { Glue } from '../Glue';
import type { ExtendedPrincipal } from '../types/ExtendedPrincipal';


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
import addGetMemberships from './addGetMemberships'


type ExtendedUser = User & {
	getMemberships: OneOrMore<ExtendedPrincipal>
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
				getMemberships: {
					args: {
						transitive: GraphQLBoolean
					},
					resolve({
						args: {
							transitive = false
						},
						source: {
							key
						}
					}: {
						args: {
							transitive?: boolean
						}
						source: {
							key: UserKey
						}
					}) {
						return membershipsResolver({
							args: {
								principalKey: key,
								transitive
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


export default addGetUser;
