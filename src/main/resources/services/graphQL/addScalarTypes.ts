import {
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	nonNull
	//@ts-ignore
} from '/lib/graphql';


export function addScalarTypes({
	glue
}) {
	glue.addScalarType({
		name: '_branchId',
		type: nonNull(GraphQLID)
	});

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
		name: '_repoId',
		type: nonNull(GraphQLID)
	});

	glue.addScalarType({
		name: '_score',
		type: nonNull(GraphQLInt)
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
}
