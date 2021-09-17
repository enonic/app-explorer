import {
	GraphQLString,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';


const {
	createObjectType
} = newSchemaGenerator();


export const GQL_TYPE_ID = nonNull(GraphQLString);
export const GQL_TYPE_NAME = nonNull(GraphQLString);
export const GQL_TYPE_NODE_TYPE = nonNull(GraphQLString);
export const GQL_TYPE_PATH = nonNull(GraphQLString);
export const GQL_TYPE_VERSION_KEY = nonNull(GraphQLString);

export const GQL_TYPE_NODE_DELETED = createObjectType({
	name: 'NodeDeleted',
	fields: {
		_id: { type: GQL_TYPE_ID }
	}
});
