import {isSet} from '@enonic/js-utils';

import {aggregationQueryTypeToGraphQLType} from './aggregationQueryTypeToGraphQLType';


export function queryResAggregationsObjToArray({
	obj,
	types,
	localTypes = types
}) {
	//log.debug(`obj:${toStr(obj)}`);
	//log.debug(`localTypes:${toStr(localTypes)}`);
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
