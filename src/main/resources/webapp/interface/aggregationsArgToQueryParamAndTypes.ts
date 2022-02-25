import type {Aggregation} from '/lib/explorer/types.d';
import type {
	Aggregation as MyAggregation,
	AggregationType,
	AggregationTypesObj,
	CamelToFieldObj
} from './types';


import {toStr} from '@enonic/js-utils';



export function aggregationsArgToQueryParamAndTypes<
	AggregationKey extends string = never
>({
	aggregationsArray = [],
	camelToFieldObj
} :{
	aggregationsArray :Array<MyAggregation>,
	camelToFieldObj :CamelToFieldObj
}) :[
	Record<AggregationKey, Aggregation>,
	AggregationTypesObj
]{
	//log.debug('aggregationsArgToQueryParamAndTypes aggregationsArray:%s', toStr(aggregationsArray));
	const aggregationsObj = {} as Record<AggregationKey, Aggregation>;
	const typesObj :AggregationTypesObj = {};// as AggregationTypesObj;
	//log.debug(`aggregationsArray:${toStr(aggregationsArray)}`);
	aggregationsArray.forEach(({
		name,
		subAggregations,
		...aggregations
	}) => {
		//log.debug(`rest:${toStr(rest)}`);
		/*if (isSet(aggregations[name])) {
			// TODO Throw GraphQLError
		}*/
		const type = Object.keys(aggregations)[0] as AggregationType;
		const aggregation = aggregations[type];
		typesObj[name] = { type };
		if (aggregation.field) {
			// TODO Workaround related to https://github.com/enonic/app-explorer/issues/275
			aggregation.field = camelToFieldObj[aggregation.field];
		}
		aggregationsObj[name as AggregationKey] = aggregations as unknown as Aggregation;
		if (subAggregations) {
			[
				aggregationsObj[name as AggregationKey].aggregations,
				typesObj[name].types
			] = aggregationsArgToQueryParamAndTypes({
				aggregationsArray: subAggregations,
				camelToFieldObj
			}); // recurse
		}
	});
	log.debug('aggregationsArgToQueryParamAndTypes aggregationsObj:%s', toStr(aggregationsObj));
	//log.debug('aggregationsArgToQueryParamAndTypes typesObj:%s', toStr(typesObj));
	return [aggregationsObj, typesObj];
}
