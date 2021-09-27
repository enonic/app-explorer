import {reindexCollections} from '/lib/explorer/collection/reindexCollections';
import {
	GraphQLString,
	list
} from '/lib/graphql';


export function generateReindexCollectionsField({
	GQL_TYPE_REINDEX_COLLECTIONS_REPORT
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
		type: list(GQL_TYPE_REINDEX_COLLECTIONS_REPORT)
	};
}
