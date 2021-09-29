import {
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {GQL_INPUT_TYPE_QUERY_FILTERS_NAME} from './constants';


export function generateNoQLTypes({
	glue
}) {
	const FILTERS_OBJECT_TYPE = glue.addInputType({
		name: 'Filters',
		fields: {
			hasValue: { type: glue.addInputType({
				name: 'HasValueFilter',
				fields: {
					field: { type: nonNull(GraphQLString) },
					values: { type: nonNull(list(nonNull(GraphQLString)))}
				}
			})},
			ids: { type: glue.addInputType({
				name: 'IdsFilter',
				fields: {
					values: { type: nonNull(list(nonNull(GraphQLString)))}
				}
			})}
		}
	});
	glue.addInputType({
		name: GQL_INPUT_TYPE_QUERY_FILTERS_NAME,
		fields: {
			boolean: { type: glue.addInputType({
				name: 'BooleanFilter',
				fields: {
					must: { type: FILTERS_OBJECT_TYPE },
					mustNot: { type: FILTERS_OBJECT_TYPE },
					should: { type: FILTERS_OBJECT_TYPE }
				}
			}) }
		}
	});
} // generateNoQlTypes
