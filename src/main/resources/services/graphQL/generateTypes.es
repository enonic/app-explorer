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
			_id: { type: glue.getScalarType('_id') }
		}
	});
}
