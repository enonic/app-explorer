import type {AggregationsResponse} from '/lib/explorer/types.d';

import {AggregationTypesObj} from './types.d';

import {
	isSet//,
	//toStr
} from '@enonic/js-utils';

import {aggregationQueryTypeToGraphQLType} from './aggregationQueryTypeToGraphQLType';


export function queryResAggregationsObjToArray<
	AggregationKey extends string = never
>({
	obj,
	types,
	localTypes = types
} :{
	obj :AggregationsResponse<AggregationKey>
	types :AggregationTypesObj
	localTypes? :AggregationTypesObj
}) {
	//log.debug('queryResAggregationsObjToArray obj:%s', toStr(obj));
	//log.debug('queryResAggregationsObjToArray types:%s', toStr(types));
	//log.debug('queryResAggregationsObjToArray localTypes:%s', toStr(localTypes));
	return Object.keys(obj).map((name) => {
		//log.debug(`name:${toStr(name)}`);
		const anAggregation = obj[name];
		//log.debug(`anAggregation:${toStr(anAggregation)}`);
		const {
			//avg, TODO https://github.com/enonic/xp/issues/9003
			buckets,
			count,
			//max,
			//min,
			sum,
			value
		} = anAggregation;
		//log.debug(`avg:${toStr(avg)}`);
		//log.debug(`typeof avg:${toStr(typeof avg)}`);
		//log.debug(`parseFloat(avg):${toStr(parseFloat(avg))}`);
		//log.debug(`typeof parseFloat(avg):${toStr(typeof parseFloat(avg))}`);
		const rAggregation = {
			count,
			name,
			sum,
			type: aggregationQueryTypeToGraphQLType(localTypes[name].type)
		} as {
			count :number
			name :string
			sum :number
			type :any
			buckets? :{
				docCount: number
				//from? :number | string
				//to? :number | string
				key: string
				subAggregations? :any
			}
			from? :number | string
			to? :number | string
			value? :number
		};
		/*if (isSet(avg) && isSet(parseFloat(avg))) {rAggregation.avg = avg;}
		if (isSet(max) && isSet(parseFloat(max))) {rAggregation.max = max;}
		if (isSet(min) && isSet(parseFloat(min))) {rAggregation.min = min;}*/
		if (buckets) {
			rAggregation.buckets = buckets.map(({
				docCount,
				from,
				key,
				to,
				...rest
			}) => {
				const rBucket = {
					docCount,
					key
				};
				if (isSet(from) || isSet(to)) {
					rAggregation.from = from;
					rAggregation.to = to;
				}
				//log.debug(`rest:${toStr(rest)}`);
				if (Object.keys(rest).length) {
					rBucket.subAggregations = queryResAggregationsObjToArray(rest, types[name].types); // Recurse
				}
				return rBucket;
			}); // map buckets
		} else {
			if (isSet(value)) {
				rAggregation.value = value;
			}
		} // if buckets
		return rAggregation;
	}); // map names
}
