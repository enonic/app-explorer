import type {
	// Aggregations, // uses 'aggregations' rather than 'subAggregations' :(
	TermsAggregation,
	HistogramAggregation,
	DateHistogramAggregation,
	NumericRangeAggregation,
	DateRangeAggregation,
	StatsAggregation,
	GeoDistanceAggregation,
	MinAggregation,
	MaxAggregation,
	ValueCountAggregation,
} from '@enonic-types/core';


export interface GraphQLField<
	Args extends {} = {},
	ResolveArgs extends {} = {},
	ResolvesTo extends unknown = undefined
> {
	args: Args,
	resolve: (env: {
		args: ResolveArgs
	}) => ResolvesTo,
	type: string
}


export type AggregationArg = {
	name: string

	count?: ValueCountAggregation['count']
	max?: MaxAggregation['max']
	min?: MinAggregation['min']
	dateHistogram?: DateHistogramAggregation['dateHistogram']
	geoDistance?: GeoDistanceAggregation['geoDistance']
	histogram?: HistogramAggregation['histogram']
	range?: NumericRangeAggregation['range']
	stats?: StatsAggregation['stats']
	terms?: TermsAggregation['terms']

	subAggregations?: AggregationArg[]
}
