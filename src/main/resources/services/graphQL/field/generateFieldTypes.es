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

import {GQL_TYPE_REFERENCED_BY_NAME} from '../generateReferencedByField';
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
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_PATH,
	schemaGenerator
}) {
	const {
		createEnumType,
		createObjectType//,
		//createUnionType
	} = schemaGenerator;

	const INSTRUCTION_CUSTOM = 'custom';

	const GQL_ENUM_INSTRUCTION = createEnumType({
		name: 'EnumInstructions',
		values: [
			...INDEX_CONFIG_TEMPLATES,
			INSTRUCTION_CUSTOM
		]
	});


	const GQL_TYPE_INDEX_CONFIG_OBJECT = createObjectType({
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
		_name: { type: GQL_TYPE_NAME },
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

	const GQL_TYPE_FIELD = createObjectType({
		name: 'Field',
		fields: {
			...GQL_FIELDS_FIELD_COMMON,
			_id: { type: GraphQLString }, // NOTE System fields doesn't have _id
			_nodeType: { type: GraphQLString },
			_path: { type: GraphQLString }, // NOTE System fields doesn't have _path
			referencedBy: {
				resolve: ({source: {_id}}) => referencedByMapped({_id}),
				type: reference(GQL_TYPE_REFERENCED_BY_NAME)
			}
		}
	});

	return {
		GQL_TYPE_FIELD_NODE: createObjectType({
			name: 'FieldNode',
			fields: {
				...GQL_FIELDS_FIELD_COMMON,
				_id: { type: GQL_TYPE_ID },
				_nodeType: { type: nonNull(GraphQLString) },
				_path: { type: GQL_TYPE_PATH }
			}
		}),
		GQL_TYPE_FIELDS_QUERY_RESULT: createObjectType({
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
		})
	};
} // generateFieldTypes
