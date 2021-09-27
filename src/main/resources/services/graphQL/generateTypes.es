import {
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	nonNull
} from '/lib/graphql';


export function generateTypes({
	schemaGenerator
}) {
	const {
		createObjectType
	} = schemaGenerator;
	const GQL_TYPE_ID = nonNull(GraphQLID);
	return {
		GQL_TYPE_COUNT: nonNull(GraphQLInt),
		GQL_TYPE_ID,
		GQL_TYPE_NAME: nonNull(GraphQLString),
		GQL_TYPE_NODE_DELETED: createObjectType({
			name: 'NodeDeleted',
			fields: {
				_id: { type: GQL_TYPE_ID }
			}
		}),
		GQL_TYPE_NODE_TYPE: nonNull(GraphQLString),
		GQL_TYPE_PATH: nonNull(GraphQLString),
		GQL_TYPE_TOTAL: nonNull(GraphQLInt),
		GQL_TYPE_VERSION_KEY: nonNull(GraphQLID)
	};
}
