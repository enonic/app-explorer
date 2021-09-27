import {
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';


export function generateNoQLTypes({
	schemaGenerator
}) {

	const {
		createInputObjectType
	} = schemaGenerator;

	const HAS_VALUE_FILTER_OBJECT_TYPE = createInputObjectType({
		name: 'HasValueFilter',
		//description:,
		fields: {
			field: { type: nonNull(GraphQLString) },
			values: { type: nonNull(list(nonNull(GraphQLString)))}
		}
	});

	const IDS_FILTER_INPUT_OBJECT_TYPE = createInputObjectType({
		name: 'IdsFilter',
		//description:,
		fields: {
			values: { type: nonNull(list(nonNull(GraphQLString)))}
		}
	});

	const FILTERS_OBJECT_TYPE = createInputObjectType({
		name: 'Filters',
		//description:,
		fields: {
			hasValue: { type: HAS_VALUE_FILTER_OBJECT_TYPE },
			ids: { type: IDS_FILTER_INPUT_OBJECT_TYPE }
		}
	});

	return {
		QUERY_FILTERS_INPUT_OBJECT_TYPE: createInputObjectType({
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
		})
	}; // return

} // generateNoQlTypes
