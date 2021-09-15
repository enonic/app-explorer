import {
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

import {reindexCollections} from './reindexCollections';


const {
	createObjectType
} = newSchemaGenerator();


export const fieldCollectionsReindex = {
	args: {
		collectionIds: list(GraphQLString)
	},
	resolve: ({
		args: {
			collectionIds = []
		} = {}
	}) => reindexCollections({collectionIds}),
	type: list(createObjectType({
		name: 'ReindexReport',
		fields: {
			collectionId: { type: nonNull(GraphQLString) },
			collectionName: { type: GraphQLString },
			message: { type: GraphQLString },
			documentTypeId: { type: GraphQLString },
			taskId: { type: GraphQLString }
		}
	}))
}; // fieldCollectionsReindex
