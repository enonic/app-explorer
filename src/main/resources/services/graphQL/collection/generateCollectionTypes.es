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
	GQL_INPUT_TYPE_COLLECTION_COLLECTOR_NAME,
	GQL_INPUT_TYPE_COLLECTION_CRON_NAME,
	GQL_INPUT_TYPE_FILTERS_NAME,
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_COLLECTION_COLLECTOR_NAME,
	GQL_TYPE_COLLECTION_NAME,
	GQL_TYPE_COLLECTION_REINDEX_REPORT,
	GQL_TYPE_COLLECTIONS_QUERY_RESULT,
	GQL_TYPE_HAS_FIELD_QUERY_RESULT_NAME
} from '../constants';
import {hasField} from './hasField';


export function generateCollectionTypes({
	glue
}) {
	glue.addObjectType({ // optional
		name: GQL_TYPE_COLLECTION_COLLECTOR_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			configJson: { type: GraphQLJson } // Can be null when no config yet...
		}
	});

	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	const GQL_TYPE_COLLECTION_FIELDS = {
		...interfaceNodeFields,
		__hasField: { // Specific to 'Collection', not 'AnyNode'
			args: {
				count: GraphQLInt,
				field: nonNull(GraphQLString),
				filters: glue.getInputType(GQL_INPUT_TYPE_FILTERS_NAME)
			},
			resolve: ({
				args: {
					count,
					field,
					filters
				},
				source: {
					_name: collectionName
				}
			}) => hasField({
				collectionName,
				count,
				field,
				filters
			}),
			type: glue.getObjectType(GQL_TYPE_HAS_FIELD_QUERY_RESULT_NAME)
		},
		createdTime: { type: GraphQLDateTime },
		creator: { type: GraphQLString },
		collector: { type: glue.getObjectType(GQL_TYPE_COLLECTION_COLLECTOR_NAME) },
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
		fields: GQL_TYPE_COLLECTION_FIELDS,
		interfaces: [interfaceNodeType]
	});
	glue.addInputType({
		name: GQL_INPUT_TYPE_COLLECTION_COLLECTOR_NAME,
		fields: {
			name: { type: nonNull(GraphQLString) },
			configJson: { type: GraphQLJson } // Can be null when no config yet...
		}
	});
	glue.addInputType({
		name: GQL_INPUT_TYPE_COLLECTION_CRON_NAME,
		fields: {
			minute: { type: GraphQLString },
			hour: { type: GraphQLString },
			dayOfMonth: { type: GraphQLString },
			month: { type: GraphQLString },
			dayOfWeek: { type: GraphQLString }
		}
	});
	glue.addObjectType({
		name: GQL_TYPE_COLLECTIONS_QUERY_RESULT,
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			page: { type: GraphQLInt },
			pageStart: { type: GraphQLInt },
			pageEnd: { type: GraphQLInt },
			pagesTotal: { type: GraphQLInt },
			hits: { type: list(GQL_TYPE_COLLECTION_WITH_SCORE) }
		} // fields
	});
	glue.addObjectType({
		name: GQL_TYPE_COLLECTION_REINDEX_REPORT,
		fields: {
			collectionId: { type: glue.getScalarType('_id') },
			collectionName: { type: GraphQLString },
			message: { type: GraphQLString },
			documentTypeId: { type: glue.getScalarType('_id') },
			taskId: { type: GraphQLString }
		}
	});
}
