import {
	isString//,
	//toStr
} from '@enonic/js-utils';
import getIn from 'get-value';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';


const {
	createObjectType
} = newSchemaGenerator();


const GQL_TYPE_FIELD = createObjectType({
	name: 'Field',
	//description:
	fields: {
		_id: { type: GraphQLString }, // NOTE System fields doesn't have _id
		_name: { type: nonNull(GraphQLString) },
		_nodeType: { type: GraphQLString },
		_path: { type: GraphQLString }, // NOTE System fields doesn't have _path
		decideByType: { type: GraphQLBoolean }, // TODO nonNull?
		denyDelete: { type: GraphQLBoolean },
		enabled: { type: GraphQLBoolean }, // TODO nonNull?
		fieldType: { type: nonNull(GraphQLString) },
		includeInAllText: { type: GraphQLBoolean }, // TODO nonNull?
		indexConfig: { type: GraphQLString }, // NOTE System field _allText doesn't have indexconfig
		inResults: { type: GraphQLBoolean },
		instruction: { type: GraphQLString }, // TODO nonNull?
		key: { type: nonNull(GraphQLString) },
		nGram: { type: GraphQLBoolean },
		path: { type: GraphQLBoolean }
	}
});

export function coerseFieldType({
	_id,
	_name,
	_nodeType,
	_path,
	denyDelete,
	indexConfig,
	inResults,
	fieldType,
	key
}) {
	return {
		_id,
		_name,
		_nodeType,
		_path,
		decideByType: getIn(indexConfig, 'decideByType', true),
		denyDelete,
		enabled: getIn(indexConfig, 'enabled', true),
		fieldType,
		fulltext: getIn(indexConfig, 'fulltext', true),
		includeInAllText: getIn(indexConfig, 'includeInAllText', true),
		indexConfig,
		inResults,
		instruction: isString(indexConfig) ? indexConfig : 'custom',
		key,
		nGram: getIn(indexConfig, 'nGram', true), // node._indexConfig.default.nGram uses uppercase G in nGram
		path: getIn(indexConfig, 'path', false)
	};
}

export const GQL_TYPE_FIELDS_QUERY_RESULT = createObjectType({
	name: 'FieldsQueryResult',
	//description:
	fields: {
		total: { type: nonNull(GraphQLInt) },
		count: { type: nonNull(GraphQLInt) },
		/*page: { type: nonNull(GraphQLInt) },
		pageStart: { type: nonNull(GraphQLInt) },
		pageEnd: { type: nonNull(GraphQLInt) },
		pagesTotal: { type: nonNull(GraphQLInt) },*/
		hits: { type: list(GQL_TYPE_FIELD) }
	} // fields
});
