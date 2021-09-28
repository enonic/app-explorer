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
	const GQL_TYPE_NAME = nonNull(GraphQLString);
	const GQL_TYPE_NODE_TYPE = nonNull(GraphQLString); // TODO enum or scalar?
	const GQL_TYPE_PATH = nonNull(GraphQLString);

	return {
		GQL_TYPE_COUNT: nonNull(GraphQLInt),
		GQL_TYPE_ID,
		GQL_TYPE_NAME,
		GQL_TYPE_NODE_DELETED: createObjectType({
			name: 'NodeDeleted',
			fields: {
				_id: { type: GQL_TYPE_ID }
			}
		}),
		GQL_TYPE_NODE_TYPE,
		GQL_TYPE_PATH,
		GQL_TYPE_TOTAL: nonNull(GraphQLInt),
		GQL_TYPE_VERSION_KEY: nonNull(GraphQLID)
	};
}
