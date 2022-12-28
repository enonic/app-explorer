import type {
	GroupKey,
	RoleKey
} from '/lib/xp/auth';
import type { Glue } from '../Glue';


import {
	GraphQLString,
	nonNull,
	list,
	// @ts-ignore
} from '/lib/graphql';
import {getMembers} from '/lib/xp/auth';
import { GQL_QUERY_MEMBERS_GET_NAME } from '../constants';
import addPrincipalType from './addPrincipalType';


function addGetMembers({
	glue
}: {
	glue: Glue
}) {
	return glue.addQuery<{
		principalKey: GroupKey|RoleKey
	}>({
		name: GQL_QUERY_MEMBERS_GET_NAME,
		args: {
			principalKey: nonNull(GraphQLString)
		},
		resolve({
			args: {
				principalKey
			}
		}) {
			return getMembers(principalKey)
		},
		type: list(addPrincipalType({glue}))
	});
}

export default addGetMembers;
