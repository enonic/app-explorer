import {
	GraphQLString,
	list,
	nonNull
} from '/lib/graphql';

import {GQL_INPUT_TYPE_FILTER_IDS} from './constants';


export function generateInputTypes(glue) {
	return {
		GRAPHQL_INPUT_TYPE_FILTER_IDS: glue.addInputType({
			name: GQL_INPUT_TYPE_FILTER_IDS,
			fields: {
				values: { type: nonNull(list(GraphQLString)) }
			}
		})
	};
}

/*const GRAPHQL_INPUT_TYPE_FILTER_EXISTS = createInputObjectType({
	name: 'InputTypeFilterExists',
	fields: {
		field: { type: nonNull(GraphQLString) }
	}
});

const GRAPHQL_INPUT_TYPE_FILTER_HAS_VALUE = createInputObjectType({
	name: 'InputTypeFilterHasValue',
	fields: {
		field: { type: nonNull(GraphQLString) },
		values: { type: nonNull(list(GraphQLString)) }
	}
});*/

/*const GRAPHQL_INPUT_TYPE_AGGREGATION_STATS = createInputObjectType({
	name: 'InputTypeAggregationStats',
	fields: {
		field: {
			type: nonNull(GraphQLString)
		}
	}
});*/

/*const GRAPHQL_INPUT_TYPE_AGGREGATION_TERMS = createInputObjectType({
	name: 'InputTypeAggregationTerms',
	fields: {
		field: {
			type: nonNull(GraphQLString)
		},
		order: {
			type: GraphQLString
		},
		size: {
			type: GraphQLInt
		},
		minDocCount: {
			type: GraphQLInt
		}
	}
});*/

// TODO: range, dateRange, dateHistogram, geoDistance, min, max and valueCount
// https://github.com/enonic/lib-guillotine/blob/master/src/main/resources/lib/guillotine/generic/input-types.js

/*const GRAPHQL_INPUT_TYPE_FILTER_NOT_EXISTS = createInputObjectType({
	name: 'InputTypeFilterNotExists',
	fields: {
		field: { type: nonNull(GraphQLString) }
	}
});

const GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS = {
	exists: { type: GRAPHQL_INPUT_TYPE_FILTER_EXISTS },
	hasValue: { type: GRAPHQL_INPUT_TYPE_FILTER_HAS_VALUE },
	ids: { type: GRAPHQL_INPUT_TYPE_FILTER_IDS },
	notExists: { type: GRAPHQL_INPUT_TYPE_FILTER_NOT_EXISTS }
};

const GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN = createInputObjectType({
	name: 'InputTypeFilterBoolean',
	fields: {
		must: { type: list(createInputObjectType({
			name: 'InputTypeFilterBooleanMust',
			fields: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS
		}))},
		mustNot: { type: list(createInputObjectType({
			name: 'InputTypeFilterBooleanMustNot',
			fields: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS
		}))},
		should: { type: list(createInputObjectType({
			name: 'InputTypeFilterBooleanShould',
			fields: GRAPHQL_INPUT_TYPE_FILTER_BOOLEAN_FIELDS_FIELDS
		}))}
	}
});*/
