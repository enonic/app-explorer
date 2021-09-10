import {
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING
} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	newSchemaGenerator,
	nonNull,
	list
} from '/lib/graphql';

import {
	GQL_TYPE_ID,
	GQL_TYPE_NAME
} from '../types';

const {
	createEnumType,
	createInputObjectType,
	createObjectType
} = newSchemaGenerator();

const ENUM_VALUE_TYPES = createEnumType({
	name: 'EnumValueTypes',
	values: [
		VALUE_TYPE_BOOLEAN,
		VALUE_TYPE_DOUBLE,
		VALUE_TYPE_GEO_POINT,
		VALUE_TYPE_INSTANT,
		VALUE_TYPE_LOCAL_DATE,
		VALUE_TYPE_LOCAL_DATE_TIME,
		VALUE_TYPE_LOCAL_TIME,
		VALUE_TYPE_LONG,
		VALUE_TYPE_SET,
		VALUE_TYPE_STRING
	]
});

const FIELDS_PROPERTY = {
	enabled: { type: nonNull(GraphQLBoolean) },
	fulltext: { type: nonNull(GraphQLBoolean) },
	includeInAllText: { type: nonNull(GraphQLBoolean) },
	max: { type: nonNull(GraphQLInt) },
	min: { type: nonNull(GraphQLInt) },
	ngram: { type: nonNull(GraphQLBoolean) },
	name: { type: GQL_TYPE_NAME },
	valueType: { type: nonNull(ENUM_VALUE_TYPES) }
};

export const GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES = createInputObjectType({
	name: 'InputDocumentTypeProperties',
	fields: FIELDS_PROPERTY
});

export const GQL_TYPE_DOCUMENT_TYPE_PROPERTIES = createObjectType({
	name: 'DocumentTypeProperties',
	fields: FIELDS_PROPERTY
});

export const GQL_TYPE_DOCUMENT_TYPE = createObjectType({
	name: 'DocumentType',
	fields: {
		_id: { type: GQL_TYPE_ID },
		_name: { type: GQL_TYPE_NAME },
		_path: { type: nonNull(GraphQLString) },
		_versionKey: { type: nonNull(GraphQLString) }, // Used with atomicUpdate
		properties: { type: list(GQL_TYPE_DOCUMENT_TYPE_PROPERTIES)}
	}
});

export const GQL_TYPE_DOCUMENT_TYPE_CREATE = createObjectType({
	name: 'DocumentTypeCreate',
	fields: {
		_id: { type: GQL_TYPE_ID },
		_name: { type: GQL_TYPE_NAME },
		_path: { type: nonNull(GraphQLString) },
		properties: { type: list(GQL_TYPE_DOCUMENT_TYPE_PROPERTIES)}
	}
});
