import type {
	Highlight,
	QueryFilters
} from '/lib/explorer/types/index.d';

import {
	GraphQLInterfaceSearchAggregation
} from './types/Aggregation.d';


export {
	GraphQLInterfaceSearchAggregation,
	AggregationType,
	AggregationTypesObj
} from './types/Aggregation.d';


export interface CamelToFieldObj {
	[key :string] :string
}

export interface SearchResolverEnv {
	args :{
		aggregations? :GraphQLInterfaceSearchAggregation
		count :number
		//after :string
		filters? :QueryFilters
		//first :number
		highlight? :Highlight
		searchString :string
		start :number
	}
}

export interface SearchConnectionResolverEnv {
	args :{
		aggregations? :GraphQLInterfaceSearchAggregation
		after :string
		filters? :QueryFilters
		first :number
		highlight? :Highlight
		searchString :string
	}
}
