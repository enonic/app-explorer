import {
	INDEX_CONFIG_N_GRAM,
	VALUE_TYPE_BOOLEAN,
	VALUE_TYPE_DOUBLE,
	VALUE_TYPE_GEO_POINT,
	VALUE_TYPE_INSTANT,
	VALUE_TYPE_LOCAL_DATE,
	VALUE_TYPE_LOCAL_DATE_TIME,
	VALUE_TYPE_LOCAL_TIME,
	VALUE_TYPE_LONG,
	VALUE_TYPE_SET,
	VALUE_TYPE_STRING//,
	//toStr
} from '@enonic/js-utils';

import {
	coerseDocumentTypeAddFields,
	coerseDocumentTypeFields,
	coerseDocumentTypeProperties
} from '/lib/explorer/documentType/coerseDocumentType';
import {
	GraphQLBoolean,
	GraphQLInt,
	nonNull,
	list
} from '/lib/graphql';

import {
	GQL_FIELDS_DOCUMENT_TYPE_PROPERTY_NAME,
	GQL_INPUT_TYPE_DOCUMENT_TYPE_FIELDS_NAME,
	GQL_INPUT_TYPE_DOCUMENT_TYPE_PROPERTIES_NAME,
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_DOCUMENT_TYPE_NAME
} from '../constants';


export function generateDocumentTypeTypes({
	glue
}) {
	const FIELDS_PROPERTY = glue.addFields({
		name: GQL_FIELDS_DOCUMENT_TYPE_PROPERTY_NAME,
		fields: {
			active: { type: nonNull(GraphQLBoolean) },
			enabled: { type: nonNull(GraphQLBoolean) },
			fulltext: { type: nonNull(GraphQLBoolean) },
			includeInAllText: { type: nonNull(GraphQLBoolean) },
			max: { type: nonNull(GraphQLInt) },
			min: { type: nonNull(GraphQLInt) },
			name: { type: glue.getScalarType('_name') },
			[INDEX_CONFIG_N_GRAM]: { type: nonNull(GraphQLBoolean) },
			path: { type: nonNull(GraphQLBoolean) },
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
		}
	});

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

	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	glue.addObjectType({
		name: GQL_TYPE_DOCUMENT_TYPE_NAME,
		fields: {

			// This appears in source without beeing defined here:
			//__fieldKey: { type: GraphQLString }, // Passed on from field.referencedBy(documentType)

			addFields: {
				type: nonNull(GraphQLBoolean),
				resolve(env) {
					//log.debug(`env:${toStr(env)}`);
					return coerseDocumentTypeAddFields(env.source.addFields);
				}
			},
			fields: {
				resolve: (env) => coerseDocumentTypeFields(env.source.fields),
				type: list(glue.addObjectType({
					name: 'DocumentTypeFields',
					fields: {
						active: { type: nonNull(GraphQLBoolean) },
						fieldId: { type: glue.getScalarType('_id') }
					}
				}))
			},
			properties: {
				resolve: (env) => coerseDocumentTypeProperties(env.source.properties),
				type: list(glue.addObjectType({
					name: 'DocumentTypeProperties',
					fields: FIELDS_PROPERTY//glue.getFields(GQL_FIELD_DOCUMENT_TYPE_PROPERTY_NAME)
				}))
			},
			...interfaceNodeFields//glue.getInterfaceTypeFields(GQL_INTERFACE_NODE_NAME)
		},
		interfaces: [
			interfaceNodeType//glue.getInterfaceType(GQL_INTERFACE_NODE_NAME)
		]
	});

	return {
		GQL_INPUT_TYPE_ADD_FIELDS: GraphQLBoolean
	};
} // generateDocumentTypeTypes
