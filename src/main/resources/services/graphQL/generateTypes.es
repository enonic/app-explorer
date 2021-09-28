import {
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	nonNull
} from '/lib/graphql';

import {GQL_TYPE_NODE_DELETED_NAME} from './constants';


export function generateTypes({
	glue
}) {
	glue.addScalarType({
		name: '_id',
		type: nonNull(GraphQLID)
	});

	glue.addScalarType({
		name: '_name',
		type: nonNull(GraphQLString)
	});

	glue.addScalarType({
		name: '_nodeType',
		type: nonNull(GraphQLString)
	});

	glue.addScalarType({
		name: '_path',
		type: nonNull(GraphQLString)
	});

	glue.addScalarType({
		name: '_versionKey',
		type: nonNull(GraphQLID)
	});

	glue.addScalarType({
		name: 'count',
		type: nonNull(GraphQLInt)
	});

	glue.addScalarType({
		name: 'total',
		type: nonNull(GraphQLInt)
	});

	glue.addObjectType({
		name: GQL_TYPE_NODE_DELETED_NAME,
		fields: {
			_id: { type: glue.scalarTypes._id }
		}
	});

	const GQL_TYPE_ID = nonNull(GraphQLID);
	const GQL_TYPE_NAME = nonNull(GraphQLString);
	const GQL_TYPE_NODE_TYPE = nonNull(GraphQLString); // TODO enum or scalar?
	const GQL_TYPE_PATH = nonNull(GraphQLString);

	return {
		GQL_TYPE_COUNT: nonNull(GraphQLInt),
		GQL_TYPE_ID,
		GQL_TYPE_NAME,
		GQL_TYPE_NODE_DELETED: glue.objectTypes[GQL_TYPE_NODE_DELETED_NAME],
		GQL_TYPE_NODE_TYPE,
		GQL_TYPE_PATH,
		GQL_TYPE_TOTAL: nonNull(GraphQLInt),
		GQL_TYPE_VERSION_KEY: nonNull(GraphQLID)
	};
}
