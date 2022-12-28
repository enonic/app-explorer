import type { EmptyObject } from '/lib/explorer/types/index.d';
import type {
	// Group,
	GroupKey,
	Principal,
	// PrincipalKey,
	// Role,
	RoleKey,
	UserKey,
} from '/lib/xp/auth';
import type {
	Glue,
	// ObjectType,
	QueriesItem,
	// Reference,
	// UnionType,
} from '../Glue';


import {
	arrayIncludes,
	// toStr,
} from '@enonic/js-utils';
import {
	// GraphQLBoolean,
	GraphQLString,
	list,
	// nonNull,
	// reference,
	// @ts-ignore
} from '/lib/graphql';
import {
	// getMembers,
	getMemberships,
} from '/lib/xp/auth';
import {
	// GQL_INTERFACE_PRINCIPAL_NAME,
	GQL_QUERY_MEMBERSHIPS_GET_NAME,
	// GQL_TYPE_GROUP_NAME,
	// GQL_TYPE_ROLE_NAME,
	// GQL_UNION_TYPE_GROUP_OR_ROLE,
} from '../constants';
import addPrincipalType from './addPrincipalType';


// interface GroupOrRoleInterface {
// 	type: 'group'|'role';
// 	key: GroupKey|RoleKey;
// 	displayName: string;
// 	modifiedTime: string;
// 	description?: string;
// }

type ExtendedPrincipal = Principal & {
	inherited?: boolean
	// memberships?: ExtendedPrincipal[]
	parent?: ExtendedPrincipal
}

function getAllGroupsAndRole({
	principalKey,
	inherited = false,
	allMembershipsRef = [],
	parent,
	seenGroupsRef = [],
	seenRolesRef = [],
}: {
	principalKey: UserKey|GroupKey
	inherited?: boolean
	allMembershipsRef?: ExtendedPrincipal[]
	parent?: ExtendedPrincipal
	seenGroupsRef?: GroupKey[]
	seenRolesRef?: RoleKey[]
}) {
	// I don't need to find other users in groups...
	const localMemberShips = [];
	const gottenMemberShips = getMemberships( // Which groups or roles are user in.
		principalKey,
		false // transitive: boolean (false is default)
	);
	for (let i = 0; i < gottenMemberShips.length; i++) {
		const aMemberShip = gottenMemberShips[i];
		const {
			key,
			type
		} = aMemberShip;
		if (type === 'group') {
			if (!arrayIncludes(seenGroupsRef, key)) {
				seenGroupsRef.push(key);
				// const {
				// 	localMemberShips: childMemberships
				// } =
				getAllGroupsAndRole({ // Recurse
					parent: aMemberShip,
					principalKey: key,
					inherited: true,
					allMembershipsRef,
					seenGroupsRef,
					seenRolesRef
				});
				const decoratedMembership = {
					...aMemberShip,
					inherited,
					parent,
					// memberships: childMemberships
				}
				allMembershipsRef.push(decoratedMembership);
				localMemberShips.push(decoratedMembership);
			}
		} else if (type === 'role') {
			if (!arrayIncludes(seenRolesRef, key)) {
				seenRolesRef.push(key);
				const decoratedMembership = {
					...aMemberShip,
					inherited,
					parent,
					memberships: []
				}
				allMembershipsRef.push(decoratedMembership);
				localMemberShips.push(decoratedMembership);
			}
		}
	} // for
	// log.info('allMembershipsRef:%s', toStr(allMembershipsRef));
	return {
		allMembershipsRef,
		localMemberShips
	};
}


function addGetMemberships<Context extends object = EmptyObject>({
	glue
}: {
	glue: Glue
}) {
	// const futureTypesObjectRef: Partial<{
	// 	group: ObjectType<Group>
	// 	role: ObjectType<Role>
	// }> = {};

	// function groupOrRoleTypeResolver(groupOrRoleObject: Group|Role) {
	// 	log.info('groupOrRoleObject:%s', toStr(groupOrRoleObject));
	//
	// 	// GraphQLTypeReference cannot be cast to GraphQLObjectType
	// 	// return reference(GQL_INTERFACE_PRINCIPAL_NAME);
	//
	// 	// GraphQLInterfaceType cannot be cast to GraphQLObjectType
	// 	// return principalInterfaceType;
	//
	// 	const {type} = groupOrRoleObject;
	// 	if (type === 'group') {
	// 		return futureTypesObjectRef.group;
	// 		// return glue.getObjectType<Group>(GQL_TYPE_GROUP_NAME); // This works because it's resolved later
	//
	// 		// GraphQLTypeReference cannot be cast to GraphQLObjectType
	// 		// return reference(GQL_TYPE_GROUP_NAME) as Reference<ObjectType<Group>>;
	// 	} else if (type === 'role') {
	// 		return futureTypesObjectRef.role;
	// 		// return glue.getObjectType<Role>(GQL_TYPE_ROLE_NAME);
	//
	// 		// GraphQLTypeReference cannot be cast to GraphQLObjectType
	// 		// return reference(GQL_TYPE_ROLE_NAME) as Reference<ObjectType<Role>>;
	// 	}
	// 	throw new Error(`groupOrRoleTypeResolver: Unhandeled groupOrRoleObject:${toStr(groupOrRoleObject)}`);
	// }

	// const groupType = glue.addObjectType<Group>({
	// 	name: GQL_TYPE_GROUP_NAME,
	// 	fields: {
	// 		description: { type: GraphQLString },
	// 		displayName: { type: nonNull(GraphQLString) },
	// 		modifiedTime: { type: GraphQLString },
	// 		key: { type: nonNull(GraphQLString) },
	// 		type: { type: nonNull(GraphQLString) },
	// 	},
	// 	interfaces: [
	// 		// principalInterfaceType
	// 		reference(GQL_INTERFACE_PRINCIPAL_NAME)
	// 	]
	// });
	// futureTypesObjectRef.group = groupType; // So it works in the typeResolver

	// const roleType = glue.addObjectType<Role>({
	// 	name: GQL_TYPE_ROLE_NAME,
	// 	fields: {
	// 		description: { type: GraphQLString },
	// 		displayName: { type: nonNull(GraphQLString) },
	// 		modifiedTime: { type: GraphQLString },
	// 		key: { type: nonNull(GraphQLString) },
	// 		type: { type: nonNull(GraphQLString) },
	// 	},
	// 	interfaces: [
	// 		// principalInterfaceType
	// 		reference(GQL_INTERFACE_PRINCIPAL_NAME)
	// 	]
	// });
	// futureTypesObjectRef.role = roleType; // So it works in the typeResolver
	// Object.freeze(futureTypesObjectRef);

	// const groupOrRoleUnionType = glue.addUnionType<
	// 	Group|Role,
	// 	ObjectType<Group>|ObjectType<Role>
	// >({
	// 	name: GQL_UNION_TYPE_GROUP_OR_ROLE,
	// 	typeResolver(groupOrRoleObject: Group|Role) {
	// 		log.info('groupOrRoleObject:%s', toStr(groupOrRoleObject));
	// 		const {type} = groupOrRoleObject;
	// 		if (type === 'group') {
	// 			groupType
	// 		} else if (type === 'role') {
	// 			roleType
	// 		}
	// 		throw new Error(`groupOrRoleTypeResolver: Unhandeled groupOrRoleObject:${toStr(groupOrRoleObject)}`);
	// 	},
	// 	types: [
	// 		// reference(GQL_TYPE_GROUP_NAME) as Reference<ObjectType<Group>>,
	// 		// reference(GQL_TYPE_ROLE_NAME) as Reference<ObjectType<Role>>,
	// 		// A Union type must define one or more member types
	// 		// futureTypesObjectRef.group,
	// 		// futureTypesObjectRef.role,
	// 		groupType,
	// 		roleType
	// 	]
	// });

	// const principalInterfaceType =
	// glue.addInterfaceType<GroupOrRoleInterface>({
	// 	name: GQL_INTERFACE_PRINCIPAL_NAME,
	// 	fields: {
	// 		description: { type: GraphQLString },
	// 		displayName: { type: nonNull(GraphQLString) },
	// 		modifiedTime: { type: GraphQLString },
	// 		key: { type: nonNull(GraphQLString) },
	// 		type: { type: nonNull(GraphQLString) },
	// 	},
	// 	// typeResolver: groupOrRoleTypeResolver
	// 	typeResolver: glue.getUnionTypeObj<Group|Role>(GQL_UNION_TYPE_GROUP_OR_ROLE).typeResolver
	// });

	const query = glue.addQuery<{
			principalKey?: GroupKey|UserKey
		}, undefined, Principal
	>({
		args: {
			principalKey: GraphQLString
		},
		name: GQL_QUERY_MEMBERSHIPS_GET_NAME,
		resolve({
			args: {
				principalKey//: principalKeyArg
			},
			// source: {
			// 	principalKey = principalKeyArg
			// }
		}) {
			const { allMembershipsRef: memberships } = getAllGroupsAndRole({
				principalKey
			});
			// log.info('memberships:%s', toStr(memberships));
			return memberships;
		},

		// Abstract type 'PrincipalInterface' must resolve to an Object type
		// at runtime for field '[PrincipalInterface].getMemberships'.
		// Runtime Object type 'Role' is not a possible type for 'PrincipalInterface'.
		// type: list(principalInterfaceType)

		type: list(
			addPrincipalType({glue})
			// These both give java.lang.NullPointerException
			// groupOrRoleUnionType
			// glue.getUnionTypeObj<Group|Role>(GQL_UNION_TYPE_GROUP_OR_ROLE).type
		)
	});
	return query as QueriesItem<{
			principalKey?: GroupKey|UserKey
	}, Context, undefined, ExtendedPrincipal>;
}


export default addGetMemberships
