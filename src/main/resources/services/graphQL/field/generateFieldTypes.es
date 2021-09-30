import {
	INDEX_CONFIG_TEMPLATES//,
	//toStr
} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	list,
	nonNull,
	reference
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_FILTERS_NAME,
	GQL_INTERFACE_NODE_NAME,
	GQL_TYPE_FIELD_NODE_NAME,
	GQL_TYPE_FIELDS_QUERY_RESULT_NAME,
	GQL_TYPE_REFERENCED_BY_NAME
} from '../constants';
import {referencedByMapped} from '../referencedByMapped';


/*const GQL_TYPE_INDEX_CONFIG_UNION = createUnionType({
	name: 'FieldIndexConfigUnion',
	typeResolver: (source) => {
		log.debug(`source ${toStr(source)}`);
		return isString(source) ? GQL_ENUM_INSTRUCTION : GQL_TYPE_INDEX_CONFIG_OBJECT;
		//return isString(source) ? GraphQLString : GQL_TYPE_INDEX_CONFIG_OBJECT;
		//return GraphQLString;
	},
	types: [
		//GraphQLString,
		GQL_ENUM_INSTRUCTION,
		GQL_TYPE_INDEX_CONFIG_OBJECT
	]
});*/


export function generateFieldTypes({
	glue
}) {
	const INSTRUCTION_CUSTOM = 'custom';

	const GQL_ENUM_INSTRUCTION = glue.addEnumType({
		name: 'EnumInstructions',
		values: [
			...INDEX_CONFIG_TEMPLATES,
			INSTRUCTION_CUSTOM
		]
	});


	const GQL_TYPE_INDEX_CONFIG_OBJECT = glue.addObjectType({
		name: 'FieldIndexConfigObject',
		fields: {
			decideByType: { type: GraphQLBoolean },
			enabled: { type: GraphQLBoolean },
			fulltext: { type: GraphQLBoolean },
			includeInAllText: { type: GraphQLBoolean },
			nGram: { type: GraphQLBoolean },
			path: { type: GraphQLBoolean }
		}
	});

	const GQL_FIELDS_FIELD_COMMON = {
		_name: { type: glue.getScalarType('_name') },
		decideByType: { type: GraphQLBoolean }, // TODO nonNull?
		denyDelete: { type: GraphQLBoolean },
		description: { type: GraphQLString },
		enabled: { type: GraphQLBoolean }, // TODO nonNull?
		fieldType: { type: nonNull(GraphQLString) },
		fulltext: { type: GraphQLBoolean },
		includeInAllText: { type: GraphQLBoolean }, // TODO nonNull?
		indexConfig: { type: GQL_TYPE_INDEX_CONFIG_OBJECT }, // NOTE System field _allText doesn't have indexconfig
		inResults: { type: GraphQLBoolean },
		instruction: { type: GQL_ENUM_INSTRUCTION }, // TODO nonNull?
		key: { type: nonNull(GraphQLString) },
		max: { type: GraphQLInt },
		min: { type: GraphQLInt },
		nGram: { type: GraphQLBoolean },
		path: { type: GraphQLBoolean }
	};

	const GQL_TYPE_FIELD = glue.addObjectType({
		name: 'Field',
		fields: {
			...GQL_FIELDS_FIELD_COMMON,
			_id: { type: GraphQLString }, // NOTE System fields doesn't have _id
			_nodeType: { type: GraphQLString },
			_path: { type: GraphQLString }, // NOTE System fields doesn't have _path
			_referencedBy: {
				args: {
					filters: glue.getInputType(GQL_INPUT_TYPE_FILTERS_NAME)
				},
				resolve: ({
					args: {filters},
					source: {_id}
				}) => referencedByMapped({_id, filters}),
				//type: reference(GQL_TYPE_REFERENCED_BY_NAME)
				type: glue.getObjectType(GQL_TYPE_REFERENCED_BY_NAME)
			}
		}
	});

	glue.addObjectType({
		name: GQL_TYPE_FIELD_NODE_NAME,
		fields: {
			...GQL_FIELDS_FIELD_COMMON,
			...glue.getInterfaceTypeFields(GQL_INTERFACE_NODE_NAME)
			//_id: { type: glue.getScalarType('_id') },
			//_nodeType: { type: nonNull(GraphQLString) },
			//_path: { type: glue.getScalarType('_path') }
		},
		// https://github.com/enonic/lib-graphql/blob/master/docs/api.adoc#createobjecttype
		// interfaces: Array<GraphQLInterfaceType OR GraphQLTypeReference>
		interfaces: [glue.getInterfaceType(GQL_INTERFACE_NODE_NAME)]
		//interfaces: [reference(GQL_INTERFACE_NODE_NAME)]
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
