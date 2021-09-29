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

import {
	GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS_NAME,
	GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES_NAME,
	GQL_TYPE_DOCUMENT_TYPE_NAME,
	GQL_TYPE_DOCUMENT_TYPE_QUERY_RESULT_NAME
} from '../constants';
import {GQL_TYPE_REFERENCED_BY_NAME} from '../generateReferencedByField';
import {referencedByMapped} from '../referencedByMapped';


export function generateDocumentTypeTypes({
	glue
}) {
	const FIELDS_PROPERTY = {
		active: { type: nonNull(GraphQLBoolean) },
		enabled: { type: nonNull(GraphQLBoolean) },
		fulltext: { type: nonNull(GraphQLBoolean) },
		includeInAllText: { type: nonNull(GraphQLBoolean) },
		max: { type: nonNull(GraphQLInt) },
		min: { type: nonNull(GraphQLInt) },
		ngram: { type: nonNull(GraphQLBoolean) },
		name: { type: glue.getScalarType('_name') },
		valueType: { type: nonNull(glue.addEnumType({
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
		})) }
	};

	glue.addInputType({
		name: GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS_NAME,
		fields: {
			active: { type: nonNull(GraphQLBoolean) },
			fieldId: { type: glue.getScalarType('_id') }
		}
	});

	glue.addInputType({
		name: GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES_NAME,
		fields: FIELDS_PROPERTY
	});

	glue.addObjectType({
		name: GQL_TYPE_DOCUMENT_TYPE_QUERY_RESULT_NAME,
		fields: {
			total: { type: nonNull(GraphQLInt) },
			count: { type: nonNull(GraphQLInt) },
			hits: {
				type: list(glue.addObjectType({
					name: GQL_TYPE_DOCUMENT_TYPE_NAME,
					fields: {
						_id: { type: glue.getScalarType('_id') },
						_name: { type: glue.getScalarType('_name') },
						_nodeType: { type: glue.getScalarType('_nodeType') },
						_path: { type: glue.getScalarType('_path') },
						_versionKey: { type: glue.getScalarType('_versionKey') }, // Used with atomicUpdate
						addFields: { type: nonNull(GraphQLBoolean) },
						fields: { type: list(glue.addObjectType({
							name: 'DocumentTypeFields',
							fields: {
								active: { type: nonNull(GraphQLBoolean) },
								fieldId: { type: glue.getScalarType('_id') }
							}
						}))},
						properties: { type: list(glue.addObjectType({
							name: 'DocumentTypeProperties',
							fields: FIELDS_PROPERTY
						}))},
						referencedBy: {
							resolve: ({source: {_id}}) => referencedByMapped({_id}),
							type: reference(GQL_TYPE_REFERENCED_BY_NAME)
						}
					}
				}))
			}
		}
	});

	return {
		GQL_INPUT_TYPE_ADD_FIELDS: GraphQLBoolean
	};
} // generateDocumentTypeTypes
