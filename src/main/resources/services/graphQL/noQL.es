import {
	createInputObjectType,
	//createObjectType,
	//GraphQLBoolean,
	//GraphQLFloat,
	//GraphQLID,
	//GraphQLInt,
	GraphQLString,
	list,
	nonNull//,
	//reference
} from '/lib/graphql';


const HAS_VALUE_FILTER_OBJECT_TYPE = createInputObjectType({
	name: 'HasValueFilter',
	//description:,
	fields: {
		field: { type: nonNull(GraphQLString) },
		values: { type: nonNull(list(nonNull(GraphQLString)))}
	}
}); // HAS_VALUE_FILTER_OBJECT_TYPE


const IDS_FILTER_INPUT_OBJECT_TYPE = createInputObjectType({
	name: 'IdsFilter',
	//description:,
	fields: {
		values: { type: nonNull(list(nonNull(GraphQLString)))}
	}
}); // IDS_FILTER_INPUT_OBJECT_TYPE


const FILTERS_OBJECT_TYPE = createInputObjectType({
	name: 'Filters',
	//description:,
	fields: {
		hasValue: { type: HAS_VALUE_FILTER_OBJECT_TYPE },
		ids: { type: IDS_FILTER_INPUT_OBJECT_TYPE }
	}
}); // HAS_VALUE_FILTER_OBJECT_TYPE


export const QUERY_FILTERS_INPUT_OBJECT_TYPE = createInputObjectType({
	name: 'QueryFilters',
	//description:,
	fields: {
		boolean: { type: createInputObjectType({
			name: 'BooleanFilter',
			//description:,
			fields: {
				must: { type: FILTERS_OBJECT_TYPE },
				mustNot: { type: FILTERS_OBJECT_TYPE },
				should: { type: FILTERS_OBJECT_TYPE }
			}
		}) }
	}
}); // FILTERS_OBJECT_TYPE
