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
	GQL_TYPE_COLLECTION_COLLECTOR_NAME,
	GQL_TYPE_COLLECTION_NAME
} from '../constants';


export function generateCollectionTypes({
	glue
}) {
	const {
		scalarTypes
	} = glue;

	glue.addObjectType({ // optional
		name: GQL_TYPE_COLLECTION_COLLECTOR_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			configJson: { type: GraphQLJson } // Can be null when no config yet...
		}
	});

	const GQL_TYPE_COLLECTION_FIELDS = {
		_id: { type: scalarTypes._id },
		_name: { type: scalarTypes._name },
		_nodeType: { type: scalarTypes._nodeType },
		_path: { type: scalarTypes._path },
		createdTime: { type: GraphQLDateTime },
		creator: { type: GraphQLString },
		collector: { type: glue.objectTypes[GQL_TYPE_COLLECTION_COLLECTOR_NAME]},
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
	const GQL_TYPE_COLLECTION_WITH_SCORE = glue.addObjectType({
		name: 'CollectionWithScore', // [_A-Za-z][_0-9A-Za-z]*
		fields: {
			...GQL_TYPE_COLLECTION_FIELDS,
			_score: { type: nonNull(GraphQLFloat) }
		}
	});
	glue.addObjectType({
		name: GQL_TYPE_COLLECTION_NAME,
		fields: GQL_TYPE_COLLECTION_FIELDS
	});
	return {
		GQL_INPUT_TYPE_COLLECTOR: glue.addInputType({
			name: 'CollectionCollectorInput',
			fields: {
				name: { type: nonNull(GraphQLString) },
				configJson: { type: GraphQLJson } // Can be null when no config yet...
			}
		}),
		GQL_INPUT_TYPE_CRON: glue.addInputType({
			name: 'CollectionCronInput',
			fields: {
				minute: { type: GraphQLString },
				hour: { type: GraphQLString },
				dayOfMonth: { type: GraphQLString },
				month: { type: GraphQLString },
				dayOfWeek: { type: GraphQLString }
			}
		}),
		GQL_TYPE_COLLECTION: glue.objectTypes[GQL_TYPE_COLLECTION_NAME],/*createObjectType({
			name: GQL_TYPE_COLLECTION_NAME,
			fields: GQL_TYPE_COLLECTION_FIELDS
		}),*/
		GQL_TYPE_COLLECTION_QUERY_RESULT: glue.addObjectType({
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
		GQL_TYPE_REINDEX_COLLECTIONS_REPORT: glue.addObjectType({
			name: 'ReindexReport',
			fields: {
				collectionId: { type: scalarTypes._id },
				collectionName: { type: GraphQLString },
				message: { type: GraphQLString },
				documentTypeId: { type: scalarTypes._id },
				taskId: { type: GraphQLString }
			}
		})
	};
}
