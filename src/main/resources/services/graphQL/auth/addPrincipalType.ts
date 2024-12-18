import type { Glue } from '../Glue';
import type { ExtendedPrincipal } from '../types/ExtendedPrincipal';

import {
	GraphQLBoolean,
	GraphQLString,
	// list,
	nonNull,
	reference,
	// @ts-ignore
} from '/lib/graphql';
import { GQL_TYPE_PRINCIPAL_NAME } from '../constants';


function addPrincipalType({
	glue
}: {
	glue: Glue
}) {
	return glue.addObjectType<ExtendedPrincipal>({
		name: GQL_TYPE_PRINCIPAL_NAME,
		fields: {
			displayName: { type: nonNull(GraphQLString) },
			modifiedTime: { type: GraphQLString },
			key: { type: nonNull(GraphQLString) },
			type: { type: nonNull(GraphQLString) },
			// Only Group and Role has this, not User
			description: { type: GraphQLString },
			// Only User has these, thus optional...
			disabled: { type: GraphQLBoolean },
			email: { type: GraphQLString },
			login: { type: GraphQLString },
			idProvider: { type: GraphQLString },
			// My additions
			inherited: { type: GraphQLBoolean },
			parent: { type: reference(GQL_TYPE_PRINCIPAL_NAME) },
			// memberships: { type: list(reference(GQL_TYPE_PRINCIPAL_NAME)) },
		},
		// interfaces: [
		// 	reference(GQL_INTERFACE_PRINCIPAL_NAME)
		// 	glue.getInterface(GQL_INTERFACE_PRINCIPAL_NAME)
		// ]
	});
}

export default addPrincipalType;
