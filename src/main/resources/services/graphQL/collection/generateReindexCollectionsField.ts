import {reindexCollections} from '/lib/explorer/collection/reindexCollections';
import {
	GraphQLString,
	list
	//@ts-ignore
} from '/lib/graphql';

import {GQL_TYPE_COLLECTION_REINDEX_REPORT} from '../constants';


export function generateReindexCollectionsField({
	glue
}) {
	return {
		args: {
			collectionIds: list(GraphQLString)
		},
		resolve: ({
			args: {
				collectionIds = []
			} = {}
		}) => reindexCollections({collectionIds}),
		type: list(glue.getObjectType(GQL_TYPE_COLLECTION_REINDEX_REPORT))
	};
}
