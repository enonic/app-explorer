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
	nonNull,
	list,
	reference
} from '/lib/graphql';

import {GQL_TYPE_DOCUMENT_TYPE_NAME} from '../constants';
import {GQL_TYPE_REFERENCED_BY_NAME} from '../generateReferencedByField';
import {referencedByMapped} from '../referencedByMapped';


export function generateDocumentTypeTypes({
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_NODE_TYPE,
	GQL_TYPE_PATH,
	GQL_TYPE_VERSION_KEY,
	schemaGenerator
}) {
	const {
		createEnumType,
		createInputObjectType,
		createObjectType
	} = schemaGenerator;
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
		active: { type: nonNull(GraphQLBoolean) },
		enabled: { type: nonNull(GraphQLBoolean) },
		fulltext: { type: nonNull(GraphQLBoolean) },
		includeInAllText: { type: nonNull(GraphQLBoolean) },
		max: { type: nonNull(GraphQLInt) },
		min: { type: nonNull(GraphQLInt) },
		ngram: { type: nonNull(GraphQLBoolean) },
		name: { type: GQL_TYPE_NAME },
		valueType: { type: nonNull(ENUM_VALUE_TYPES) }
	};
	const GQL_TYPE_DOCUMENT_TYPE_FIELDS = createObjectType({
		name: 'DocumentTypeFields',
		fields: {
			active: { type: nonNull(GraphQLBoolean) },
			fieldId: { type: GQL_TYPE_ID }
		}
	});
	const GQL_TYPE_DOCUMENT_TYPE_PROPERTIES = createObjectType({
		name: 'DocumentTypeProperties',
		fields: FIELDS_PROPERTY
	});
	return {
		GQL_INPUT_TYPE_ADD_FIELDS: GraphQLBoolean,
		GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS: createInputObjectType({
			name: 'InputDocumentTypeFields',
			fields: {
				active: { type: nonNull(GraphQLBoolean) },
				fieldId: { type: GQL_TYPE_ID }
			}
		}),
		GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES: createInputObjectType({
			name: 'InputDocumentTypeProperties',
			fields: FIELDS_PROPERTY
		}),
		GQL_TYPE_DOCUMENT_TYPE: createObjectType({
			name: GQL_TYPE_DOCUMENT_TYPE_NAME,
			fields: {
				_id: { type: GQL_TYPE_ID },
				_name: { type: GQL_TYPE_NAME },
				_nodeType: { type: GQL_TYPE_NODE_TYPE },
				_path: { type: GQL_TYPE_PATH },
				_versionKey: { type: GQL_TYPE_VERSION_KEY }, // Used with atomicUpdate
				addFields: { type: nonNull(GraphQLBoolean) },
				fields: { type: list(GQL_TYPE_DOCUMENT_TYPE_FIELDS)},
				properties: { type: list(GQL_TYPE_DOCUMENT_TYPE_PROPERTIES)},
				referencedBy: {
					resolve: ({source: {_id}}) => referencedByMapped({_id}),
					type: reference(GQL_TYPE_REFERENCED_BY_NAME)
				}
			}
		})
	};
} // generateDocumentTypeTypes
