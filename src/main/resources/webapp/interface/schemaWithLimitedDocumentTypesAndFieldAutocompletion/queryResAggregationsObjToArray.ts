import type {AggregationsResponse} from '/lib/explorer/types.d';

import {AggregationTypesObj} from '../types.d';

import {
	isSet//,
	//toStr
} from '@enonic/js-utils';

import {aggregationQueryTypeToGraphQLType} from './aggregationQueryTypeToGraphQLType';


//const log = console; // Use when running tests in node without Enonic XP.


export function queryResAggregationsObjToArray<
	AggregationKey extends undefined|string = undefined
>({
	obj,
	types
} :{
	obj :AggregationsResponse<AggregationKey>
	types :AggregationTypesObj
}) {
	//log.debug('queryResAggregationsObjToArray() obj:%s', toStr(obj));
	//log.debug('queryResAggregationsObjToArray() types:%s', toStr(types));
	const aggregationsArray = Object.keys(obj).map((name) => {
		//log.debug(`queryResAggregationsObjToArray() name:${toStr(name)}`);

		const anAggregation = obj[name];
		//log.debug('queryResAggregationsObjToArray() anAggregation:%s', toStr(anAggregation));
		const {
			//avg, TODO https://github.com/enonic/xp/issues/9003
			buckets,
			count,
			//max,
			//min,
			sum,
			value
		} = anAggregation;
		//log.debug('queryResAggregationsObjToArray() buckets:%s', toStr(buckets));
		//log.debug('queryResAggregationsObjToArray() count:%s sum:%s', count, sum);
		//log.debug(`avg:${toStr(avg)}`);
		//log.debug(`typeof avg:${toStr(typeof avg)}`);
		//log.debug(`parseFloat(avg):${toStr(parseFloat(avg))}`);
		//log.debug(`typeof parseFloat(avg):${toStr(typeof parseFloat(avg))}`);
		const rAggregation = {
			name,
			type: aggregationQueryTypeToGraphQLType(types[name].type)
		} as {
			count? :number
			name :string
			sum? :number
			type :any
			buckets? :Array<{
				docCount: number
				//from? :number | string
				//to? :number | string
				key: string
				subAggregations? :any
			}>
			from? :number | string
			to? :number | string
			value? :number
		};
		if (isSet(count)) {rAggregation.count = count;}
		if (isSet(sum)) {rAggregation.sum = sum;}
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
				//log.debug('queryResAggregationsObjToArray docCount:%s from:%s key:%s to:%s rest:%s', docCount, toStr(from), key, toStr(to), toStr(rest));
				const rBucket :{
					docCount: number
					key: string
					subAggregations? :any
				} = {
					docCount,
					key
				};
				if (isSet(from) || isSet(to)) {
					rAggregation.from = from;
					rAggregation.to = to;
				}
				//log.debug(`rest:${toStr(rest)}`);
				if (Object.keys(rest).length) {
					rBucket.subAggregations = queryResAggregationsObjToArray({
						obj: rest,
						types: types[name].types
					}); // Recurse
				}
				return rBucket; // out of map
			}); // map buckets
		} else {
			if (isSet(value)) {
				rAggregation.value = value;
			}
		} // if buckets
		return rAggregation; // out of map
	}); // map names
	//log.debug('queryResAggregationsObjToArray -> aggregationsArray:%s', toStr(aggregationsArray));
	return aggregationsArray; // out of function
}
