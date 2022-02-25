import type {
	Highlight,
	QueryFilters
} from '/lib/explorer/types.d';

import {
	Aggregation
} from './types/Aggregation.d';


export {
	Aggregation,
	AggregationType,
	AggregationTypesObj
} from './types/Aggregation.d';


export interface CamelToFieldObj {
	[key :string] :string
}

export interface SearchResolverEnv {
	args :{
		aggregations? :Aggregation
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
		aggregations? :Aggregation
		after :string
		filters? :QueryFilters
		first :number
		highlight? :Highlight
		searchString :string
	}
}
