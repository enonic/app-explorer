import {
	INDEX_CONFIG_N_GRAM//,
	//toStr
} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_FIELD_NODE_NAME,
	GQL_TYPE_FIELDS_QUERY_RESULT_NAME
} from '../constants';


export function generateFieldTypes({
	glue
}) {
	const GQL_TYPE_INDEX_CONFIG_OBJECT = glue.addObjectType({
		name: 'FieldIndexConfigObject',
		fields: {
			decideByType: { type: GraphQLBoolean },
			enabled: { type: GraphQLBoolean },
			fulltext: { type: GraphQLBoolean },
			includeInAllText: { type: GraphQLBoolean },
			[INDEX_CONFIG_N_GRAM]: { type: GraphQLBoolean },
			path: { type: GraphQLBoolean }
		}
	});

	const {
		fields: interfaceNodeFields,
		type: interfaceNodeType
	} = glue.getInterfaceTypeObj(GQL_INTERFACE_NODE_NAME);

	const GQL_FIELDS_FIELD_COMMON = {
		...interfaceNodeFields,
		_name: { type: glue.getScalarType('_name') },
		decideByType: { type: GraphQLBoolean }, // TODO nonNull?
		//description: { type: GraphQLString },
		enabled: { type: GraphQLBoolean }, // TODO nonNull?
		fieldType: { type: nonNull(GraphQLString) },
		fulltext: { type: GraphQLBoolean },
		includeInAllText: { type: GraphQLBoolean }, // TODO nonNull?
		indexConfig: { type: GQL_TYPE_INDEX_CONFIG_OBJECT }, // NOTE System field _allText doesn't have indexconfig
		key: { type: nonNull(GraphQLString) },
		max: { type: GraphQLInt },
		min: { type: GraphQLInt },
		[INDEX_CONFIG_N_GRAM]: { type: GraphQLBoolean },
		path: { type: GraphQLBoolean }
	};

	const GQL_TYPE_FIELD = glue.addObjectType({
		name: 'FieldAny',
		fields: {
			...GQL_FIELDS_FIELD_COMMON,

			// NOTE System fields doesn't have these, so override without nonNull
			_id: { type: GraphQLString },
			_nodeType: { type: GraphQLString },
			_path: { type: GraphQLString }
		}//,
		//interfaces: [interfaceNodeType] // NOTE System fields doesn't quite implement the node interface
	});

	glue.addObjectType({
		name: GQL_TYPE_FIELD_NODE_NAME,
		fields: GQL_FIELDS_FIELD_COMMON,
		interfaces: [interfaceNodeType]
	});

	glue.addObjectType({
		name: GQL_TYPE_FIELDS_QUERY_RESULT_NAME,
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
} // generateFieldTypes
