import {
	DateTime as GraphQLDateTime,
	GraphQLInt,
	GraphQLFloat,
	GraphQLString,
	Json as GraphQLJson,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

import {
	GQL_TYPE_ID,
	GQL_TYPE_NAME
} from '../types';


const {
	createInputObjectType,
	createObjectType
} = newSchemaGenerator();


export const GQL_INPUT_TYPE_COLLECTOR = createInputObjectType({
	name: 'CollectionCollectorInput',
	fields: {
		name: { type: nonNull(GraphQLString) },
		configJson: { type: GraphQLJson } // Can be null when no config yet...
	}
});


export const GQL_INPUT_TYPE_CRON = createInputObjectType({
	name: 'CollectionCronInput',
	fields: {
		minute: { type: GraphQLString },
		hour: { type: GraphQLString },
		dayOfMonth: { type: GraphQLString },
		month: { type: GraphQLString },
		dayOfWeek: { type: GraphQLString }
	}
});


const GQL_TYPE_COLLECTION_FIELDS = {
	_id: { type: GQL_TYPE_ID },
	_name: { type: GQL_TYPE_NAME },
	_nodeType: { type: GraphQLString }, // TODO nonNull enum or scalar?
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
	documentTypeId: { type: GraphQLString },

	interfaces: { type: list(GraphQLString)}, // This is not a node.property
	language: { type: GraphQLString },
	modifiedTime: { type: GraphQLDateTime },
	modifier: { type: GraphQLString }
};

export const GQL_TYPE_COLLECTION = createObjectType({
	name: 'Collection', // [_A-Za-z][_0-9A-Za-z]*
	fields: GQL_TYPE_COLLECTION_FIELDS
});

const GQL_TYPE_COLLECTION_WITH_SCORE = createObjectType({
	name: 'CollectionWithScore', // [_A-Za-z][_0-9A-Za-z]*
	fields: {
		...GQL_TYPE_COLLECTION_FIELDS,
		_score: { type: nonNull(GraphQLFloat) }
	}
});

export const GQL_TYPE_COLLECTION_QUERY_RESULT = createObjectType({
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
});


export function coerseCollectionType({
	_id,
	_name,
	_nodeType,
	_path,
	_score,
	collector,
	createdTime,
	creator,
	documentCount,
	documentTypeId,
	interfaces,
	language,
	modifiedTime,
	modifier
}) {
	return {
		_id,
		_name,
		_nodeType,
		_path,
		_score,
		collector,
		createdTime,
		creator,
		documentCount,
		documentTypeId,
		interfaces,
		language,
		modifiedTime,
		modifier
	};
}
