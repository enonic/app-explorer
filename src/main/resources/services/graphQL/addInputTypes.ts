import {
	GraphQLString,
	list,
	nonNull,
	reference
	//@ts-ignore
} from '/lib/graphql';

import {
	GQL_INPUT_TYPE_FILTERS_NAME,
	GQL_INPUT_TYPE_FILTERS_BOOLEAN_NAME,
	GQL_UNIQ_TYPE,
} from './constants';


export function addInputTypes({
	glue
}) {
	glue.addInputType({
		name: GQL_UNIQ_TYPE.INPUT_FIELD_SORT_DSL,
		fields: {
			field: { type: nonNull(GraphQLString) },
			direction: { type: glue.getEnumType(GQL_UNIQ_TYPE.ENUM_SORT_DIRECTION) },
		}
	});

	glue.addInputType({
		name: GQL_INPUT_TYPE_FILTERS_NAME,
		fields: {
			boolean: { type: glue.addInputType({
				name: GQL_INPUT_TYPE_FILTERS_BOOLEAN_NAME,
				fields: {
					must: { type: list(reference(GQL_INPUT_TYPE_FILTERS_NAME)) },
					mustNot: { type: list(reference(GQL_INPUT_TYPE_FILTERS_NAME)) },
					should: { type: list(reference(GQL_INPUT_TYPE_FILTERS_NAME)) }
				}
			}) },
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
} // addInputTypes
