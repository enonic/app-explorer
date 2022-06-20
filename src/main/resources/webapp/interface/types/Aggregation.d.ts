import type {AggregationType} from '@enonic/js-utils/src/types';


export type AggregationTypesObj = {
	[key :string] :{
		type :AggregationType
		types ?:AggregationTypesObj
	}
}
