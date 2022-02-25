interface DateHistogramAggregationParams {
	field: string;
	interval: string;
	minDocCount: number;
	format: string;
}

interface DateRangeAggregationParams {
	field: string;
	format: string;
	ranges: Array<{
		from?: string;
		to?: string;
	}>;
}

interface GeoDistanceAggregationParams {
	field: string;
	ranges?: Array<{
		from?: number;
		to?: number;
	}>;
	range?: {
		from: number;
		to: number;
	};
	unit: string;
	origin: {
		lat: string;
		lon: string;
	};
}

interface MaxAggregationParams {
	field: string;
}

interface MinAggregationParams {
	field: string;
}

interface RangeAggregationParams {
	field: string;
	ranges?: Array<{
		from?: number;
		to?: number;
	}>;
	range?: {
		from: number;
		to: number;
	};
}

interface StatsAggregationParams {
	// Required
	field :string;
	// Optional
	order? :string; // Default to ?
	size? :number; // Default to ?
}

interface TermsAggregationParams {
	// Required
	field :string
	// Optional
	minDocCount? :number
	order? :string // Default to '_term ASC'
	size :number // Default to 10
}

interface ValueCountAggregationParams {
	field :string
}

export interface Aggregation {
	name :string
	count? :ValueCountAggregationParams
	dateHistogram? :DateHistogramAggregationParams
	dateRange? :DateRangeAggregationParams
	geoDistance? :GeoDistanceAggregationParams
	max? :MaxAggregationParams
	min? :MinAggregationParams
	range? :RangeAggregationParams
	stats? :StatsAggregationParams
	terms? :TermsAggregationParams
	subAggregations :Array<Aggregation>
}

export type AggregationType = 'count'
	|'dateHistogram'
	|'dateRange'
	|'geoDistance'
	|'max'
	|'min'
	|'range'
	|'stats'
	|'terms'

export interface AggregationTypesObj {
	[key :string] :{
		type :AggregationType
		types? :AggregationTypesObj
	}
}
