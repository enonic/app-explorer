import {
	INDEX_CONFIG_TEMPLATE_BY_TYPE,
	INDEX_CONFIG_TEMPLATES,
	indexTemplateToConfig,
	isString//,
	//toStr
} from '@enonic/js-utils';

import {
	GraphQLBoolean,
	GraphQLInt,
	GraphQLString,
	list,
	newSchemaGenerator,
	nonNull
} from '/lib/graphql';

import {
	GQL_TYPE_ID,
	GQL_TYPE_NAME,
	GQL_TYPE_PATH
} from '../types';

const {
	createEnumType,
	createObjectType//,
	//createUnionType
} = newSchemaGenerator();


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


const GQL_FIELDS_FIELD_COMMON = {
	_name: { type: GQL_TYPE_NAME },
	decideByType: { type: GraphQLBoolean }, // TODO nonNull?
	denyDelete: { type: GraphQLBoolean },
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


export const GQL_TYPE_FIELD_NODE = createObjectType({
	name: 'FieldNode',
	fields: {
		...GQL_FIELDS_FIELD_COMMON,
		_id: { type: GQL_TYPE_ID },
		_nodeType: { type: nonNull(GraphQLString) },
		_path: { type: GQL_TYPE_PATH }
	}
});


export const GQL_TYPE_FIELD = createObjectType({
	name: 'Field',
	fields: {
		...GQL_FIELDS_FIELD_COMMON,
		_id: { type: GraphQLString }, // NOTE System fields doesn't have _id
		_nodeType: { type: GraphQLString },
		_path: { type: GraphQLString } // NOTE System fields doesn't have _path
	}
});


export function coerseFieldType({
	_id,
	_name,
	_nodeType,
	_path,
	denyDelete,
	indexConfig = INDEX_CONFIG_TEMPLATE_BY_TYPE,
	inResults,
	fieldType,
	key,
	max,
	min
}) {
	const instruction = isString(indexConfig)
		? (indexConfig === 'type'
			? INDEX_CONFIG_TEMPLATE_BY_TYPE
			: indexConfig)
		: INSTRUCTION_CUSTOM;
	//log.debug(`key:${key} instruction:${toStr(instruction)}`);

	const indexConfigObject = isString(indexConfig) ? indexTemplateToConfig({
		template: instruction
	}) : indexConfig;
	//log.debug(`key:${key} indexConfigObject:${toStr(indexConfigObject)}`);

	const {
		decideByType = true,
		enabled = true,
		fulltext = true,
		includeInAllText = true,
		nGram = true,
		path = false
	} = indexConfigObject;
	//log.debug(`key:${key} fulltext:${toStr(fulltext)}`);

	return {
		_id,
		_name,
		_nodeType,
		_path,
		denyDelete,
		fieldType,
		inResults,
		key,
		max,
		min,

		indexConfig: indexConfigObject,
		instruction,

		decideByType,
		enabled,
		fulltext,
		includeInAllText,
		nGram, // node._indexConfig.default.nGram uses uppercase G in nGram
		path
	};
} // coerseFieldType


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
