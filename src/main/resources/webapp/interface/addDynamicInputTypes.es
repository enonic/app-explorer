import {
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {
	GQL_ENUM_FIELD_KEYS_FOR_FILTERS,
	GQL_INPUT_TYPE_FILTER_EXISTS_WITH_DYNAMIC_FIELDS,
	GQL_INPUT_TYPE_FILTER_HAS_VALUE_WITH_DYNAMIC_FIELDS,
	GQL_INPUT_TYPE_FILTER_NOT_EXISTS_WITH_DYNAMIC_FIELDS
} from './constants';


export function addDynamicInputTypes({
	glue
}) {
	const enumFieldsKeysForFilters = glue.getEnumType(GQL_ENUM_FIELD_KEYS_FOR_FILTERS);

	glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_EXISTS_WITH_DYNAMIC_FIELDS,
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForFilters)
			}
		}
	});

	glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_HAS_VALUE_WITH_DYNAMIC_FIELDS,
		fields: {
			field: { type: nonNull(enumFieldsKeysForFilters) },
			values: { type: nonNull(list(GraphQLString)) }
		}
	});

	glue.addInputType({
		name: GQL_INPUT_TYPE_FILTER_NOT_EXISTS_WITH_DYNAMIC_FIELDS,
		fields: {
			field: {
				type: nonNull(enumFieldsKeysForFilters)
			}
		}
	});
}
