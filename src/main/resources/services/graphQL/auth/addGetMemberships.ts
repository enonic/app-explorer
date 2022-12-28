import type {
	Group,
	GroupKey,
	Role,
	RoleKey,
	UserKey,
} from '/lib/xp/auth';
import type {
	Glue,
	ObjectType,
	Reference,
} from '../Glue';


import {toStr} from '@enonic/js-utils';
import {
	GraphQLString,
	list,
	nonNull,
	reference,
	// @ts-ignore
} from '/lib/graphql';
import {getMemberships} from '/lib/xp/auth';
import {
	GQL_QUERY_MEMBERSHIPS_GET_NAME,
	GQL_TYPE_GROUP_NAME,
	GQL_TYPE_ROLE_NAME,
	GQL_UNION_TYPE_GROUP_OR_ROLE,
} from '../constants';


interface GroupOrRoleInterface {
	type: 'group'|'role';
	key: GroupKey|RoleKey;
	displayName: string;
	modifiedTime: string;
	description?: string;
}


function addGetMemberships({
	glue
}: {
	glue: Glue
}) {
	function groupOrRoleTypeResolver(groupOrRoleObject: Group|Role) {
		log.info('groupOrRoleObject:%s', toStr(groupOrRoleObject));
		const {type} = groupOrRoleObject;
		if (type === 'group') {
			// return groupType;
			return glue.getObjectType(GQL_TYPE_GROUP_NAME); // This works because it's resolved later
		} else if (type === 'role') {
			// return roleType;
			return glue.getObjectType(GQL_TYPE_ROLE_NAME);
		}
		throw new Error(`groupOrRoleTypeResolver: Unhandeled groupOrRoleObject:${toStr(groupOrRoleObject)}`);
	}

	const groupOrRoleUnionType = glue.addUnionType<
		Group|Role,
		ObjectType<Group>|ObjectType<Role>
	>({
		name: GQL_UNION_TYPE_GROUP_OR_ROLE,
		typeResolver: groupOrRoleTypeResolver,
		types: [
			reference(GQL_TYPE_GROUP_NAME) as Reference<ObjectType<Group>>,
			reference(GQL_TYPE_ROLE_NAME) as Reference<ObjectType<Role>>,
			// groupType,
			// roleType,
		]
	});

	const principalInterfaceType = glue.addInterfaceType<GroupOrRoleInterface>({
		name: 'PrincipalInterface',
		fields: {
			description: { type: GraphQLString },
			displayName: { type: nonNull(GraphQLString) },
			modifiedTime: { type: GraphQLString },
			key: { type: nonNull(GraphQLString) },
			type: { type: nonNull(GraphQLString) },
		},
		typeResolver: groupOrRoleTypeResolver
		// typeResolver: glue.getUnionTypeObj(GQL_UNION_TYPE_GROUP_OR_ROLE).typeResolver
	});

	// const groupType =
	glue.addObjectType<Group>({
		name: GQL_TYPE_GROUP_NAME,
		fields: {
			description: { type: GraphQLString },
			displayName: { type: nonNull(GraphQLString) },
			modifiedTime: { type: GraphQLString },
			key: { type: nonNull(GraphQLString) },
			type: { type: nonNull(GraphQLString) },
		},
		interfaces: [principalInterfaceType]
	});

	// const roleType =
	glue.addObjectType<Role>({
		name: GQL_TYPE_ROLE_NAME,
		fields: {
			description: { type: GraphQLString },
			displayName: { type: nonNull(GraphQLString) },
			modifiedTime: { type: GraphQLString },
			key: { type: nonNull(GraphQLString) },
			type: { type: nonNull(GraphQLString) },
		},
		interfaces: [principalInterfaceType]
	});

	const query = glue.addQuery<{
			principalKey?: UserKey | GroupKey
		}, {
			principalKey?: UserKey | GroupKey
		}, Group|Role
	>({
		args: {
			principalKey: GraphQLString
		},
		name: GQL_QUERY_MEMBERSHIPS_GET_NAME,
		resolve({
			args: {
				principalKey
			}
		}) {
			const memberships = getMemberships(
				principalKey,
				false // transitive: boolean (false is default)
			);
			// log.info('memberships:%s', toStr(memberships));
			return memberships;
		},
		type: list(groupOrRoleUnionType) as (typeof groupOrRoleUnionType)[]
	});
	return query;
}


export default addGetMemberships
