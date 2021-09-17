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
	GQL_TYPE_NAME,
	GQL_TYPE_PATH,
	GQL_TYPE_VERSION_KEY
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

export const GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS = createInputObjectType({
	name: 'InputDocumentTypeFields',
	fields: {
		active: { type: nonNull(GraphQLBoolean) },
		fieldId: { type: GQL_TYPE_ID }
	}
});

const GQL_TYPE_DOCUMENT_TYPE_FIELDS = createObjectType({
	name: 'DocumentTypeFields',
	fields: {
		active: { type: nonNull(GraphQLBoolean) },
		fieldId: { type: GQL_TYPE_ID }
	}
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
		_path: { type: GQL_TYPE_PATH },
		_versionKey: { type: GQL_TYPE_VERSION_KEY }, // Used with atomicUpdate
		fields: { type: list(GQL_TYPE_DOCUMENT_TYPE_FIELDS)},
		properties: { type: list(GQL_TYPE_DOCUMENT_TYPE_PROPERTIES)}
	}
});
