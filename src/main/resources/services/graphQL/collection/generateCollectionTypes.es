import {
	DateTime as GraphQLDateTime,
	GraphQLID,
	GraphQLInt,
	GraphQLFloat,
	GraphQLString,
	Json as GraphQLJson,
	list,
	nonNull
} from '/lib/graphql';

import {
	GQL_TYPE_COLLECTION_NAME
} from '../constants';


export function generateCollectionTypes({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	schemaGenerator
}) {
	const {
		createInputObjectType,
		createObjectType
	} = schemaGenerator;
	const GQL_TYPE_COLLECTION_FIELDS = {
		_id: { type: GQL_TYPE_ID },
		_name: { type: GQL_TYPE_NAME },
		_nodeType: { type: GQL_TYPE_NODE_TYPE },
		_path: { type: nonNull(GraphQLString) },
		createdTime: { type: GraphQLDateTime },
		creator: { type: GraphQLString },
		collector: { type: createObjectType({ // optional
			name: 'CollectionCollector',
			fields: {
				name: { type: nonNull(GraphQLString) },
				configJson: { type: GraphQLJson } // Can be null when no config yet...
			}
		})},
		documentCount: { type: GraphQLInt }, // This is not a node.property

		// NOTE Collections pre app-explorer-2.0.0 doesn't have documentTypeId
		// During migragrion:
		// Maybe it's possible to create a default documentType and add all global fields to it?
		// And then make all collections (which have no documentType) use that "global" documentType
		// Then again collections using collectors have documentType in code, so they wont have documentTypeId
		documentTypeId: { type: GraphQLID }, // NOTE NOT nonNull

		interfaces: { type: list(GraphQLString)}, // This is not a node.property
		language: { type: GraphQLString },
		modifiedTime: { type: GraphQLDateTime },
		modifier: { type: GraphQLString }
	};
	const GQL_TYPE_COLLECTION_WITH_SCORE = createObjectType({
		name: 'CollectionWithScore', // [_A-Za-z][_0-9A-Za-z]*
		fields: {
			...GQL_TYPE_COLLECTION_FIELDS,
			_score: { type: nonNull(GraphQLFloat) }
		}
	});
	return {
		GQL_INPUT_TYPE_COLLECTOR: createInputObjectType({
			name: 'CollectionCollectorInput',
			fields: {
				name: { type: nonNull(GraphQLString) },
				configJson: { type: GraphQLJson } // Can be null when no config yet...
			}
		}),
		GQL_INPUT_TYPE_CRON: createInputObjectType({
			name: 'CollectionCronInput',
			fields: {
				minute: { type: GraphQLString },
				hour: { type: GraphQLString },
				dayOfMonth: { type: GraphQLString },
				month: { type: GraphQLString },
				dayOfWeek: { type: GraphQLString }
			}
		}),
		GQL_TYPE_COLLECTION: createObjectType({
			name: GQL_TYPE_COLLECTION_NAME,
			fields: GQL_TYPE_COLLECTION_FIELDS
		}),
		GQL_TYPE_COLLECTION_QUERY_RESULT: createObjectType({
			name: 'CollectionsQueryResult', // [_A-Za-z][_0-9A-Za-z]*
			fields: {
				total: { type: nonNull(GraphQLInt) },
				count: { type: nonNull(GraphQLInt) },
				page: { type: GraphQLInt },
				pageStart: { type: GraphQLInt },
				pageEnd: { type: GraphQLInt },
				pagesTotal: { type: GraphQLInt },
				hits: { type: list(GQL_TYPE_COLLECTION_WITH_SCORE) }
			} // fields
		}),
		GQL_TYPE_REINDEX_COLLECTIONS_REPORT: createObjectType({
			name: 'ReindexReport',
			fields: {
				collectionId: { type: GQL_TYPE_ID },
				collectionName: { type: GraphQLString },
				message: { type: GraphQLString },
				documentTypeId: { type: GQL_TYPE_ID },
				taskId: { type: GraphQLString }
			}
		})
	};
}
