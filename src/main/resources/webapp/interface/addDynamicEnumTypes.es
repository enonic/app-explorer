import {
	GQL_ENUM_FIELD_KEYS_FOR_AGGREGATIONS,
	GQL_ENUM_FIELD_KEYS_FOR_FILTERS
} from './constants';


export function addDynamicEnumTypes({
	fieldKeysForAggregations,
	fieldKeysForFilters,
	glue
}) {
	glue.addEnumType({
		name: GQL_ENUM_FIELD_KEYS_FOR_AGGREGATIONS,
		values: fieldKeysForAggregations
	});
	glue.addEnumType({
		name: GQL_ENUM_FIELD_KEYS_FOR_FILTERS,
		values: fieldKeysForFilters
	});
}
