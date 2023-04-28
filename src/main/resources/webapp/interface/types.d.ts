import type {AggregationForGraphQLSchemaQueryArgsInputType} from '@enonic/js-utils/src/types';
import type {
	Highlight,
	QueryFilters
} from '@enonic-types/lib-explorer';


export {
	AggregationType,
	AggregationTypesObj
} from './types/Aggregation.d';


export type CamelToFieldObj = {
	[key :string] :string
}

export type SearchResolverEnv = {
	args :{
		aggregations ?:Array<AggregationForGraphQLSchemaQueryArgsInputType>
		count :number
		//after :string
		filters? :QueryFilters
		//first :number
		highlight? :Highlight
		searchString :string
		start :number
	}
}

export type SearchConnectionResolverEnv = {
	args :{
		aggregations ?:Array<AggregationForGraphQLSchemaQueryArgsInputType>
		after :string
		filters? :QueryFilters
		first :number
		highlight? :Highlight
		searchString :string
	}
}
