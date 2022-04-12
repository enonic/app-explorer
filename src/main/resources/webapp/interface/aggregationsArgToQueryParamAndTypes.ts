import type {Aggregation} from '/lib/explorer/types.d';
import type {
	GraphQLInterfaceSearchAggregation,
	AggregationType,
	AggregationTypesObj,
	CamelToFieldObj
} from './types';


import {
	isSet,
	//toStr
} from '@enonic/js-utils';


//const log = console; // Use when running tests in node without Enonic XP.


export function aggregationsArgToQueryParamAndTypes<
	AggregationKey extends string = never
>({
	gqlSearchArgAggregationsArray = [],
	camelToFieldObj
} :{
	gqlSearchArgAggregationsArray :Array<GraphQLInterfaceSearchAggregation>,
	camelToFieldObj :CamelToFieldObj
}) :[
	Record<AggregationKey, Aggregation>,
	AggregationTypesObj
]{
	//log.debug('aggregationsArgToQueryParamAndTypes({gqlSearchArgAggregationsArray:%s, camelToFieldObj:%s})', toStr(gqlSearchArgAggregationsArray), toStr(camelToFieldObj));
	const repoQueryAggregationsObj = {} as Record<AggregationKey, Aggregation>;
	const typesObj :AggregationTypesObj = {};// as AggregationTypesObj;
	//log.debug(`gqlSearchArgAggregationsArray:${toStr(gqlSearchArgAggregationsArray)}`);
	gqlSearchArgAggregationsArray.forEach(({
		name,
		subAggregations,
		...gqlAggregations
	}) => {
		//log.debug(`gqlAggregations:${toStr(gqlAggregations)}`); // {terms: {field: 'name', size: 10}}
		if (isSet(typesObj[name])) {
			throw new Error(`Aggregation name must be unique per level!`);
		}
		const type = Object.keys(gqlAggregations)[0] as AggregationType;
		//log.debug(`type:${toStr(type)}`); // 'terms'
		typesObj[name] = { type };

		const gqlAggregation = gqlAggregations[type];
		//log.debug(`gqlAggregation:${toStr(gqlAggregation)}`); // {field: 'name', size: 10}

		if (gqlAggregation.field) {
			// TODO Workaround related to https://github.com/enonic/app-explorer/issues/275
			if (camelToFieldObj[gqlAggregation.field]) {
				gqlAggregation.field = camelToFieldObj[gqlAggregation.field];
			}
		}
		repoQueryAggregationsObj[name as AggregationKey] = {
			[type]: gqlAggregation
		} as unknown as Aggregation;
		if (subAggregations) {
			[
				repoQueryAggregationsObj[name as AggregationKey].aggregations,
				typesObj[name].types
			] = aggregationsArgToQueryParamAndTypes({
				gqlSearchArgAggregationsArray: subAggregations,
				camelToFieldObj
			}); // recurse
		}
	});
	//log.debug('aggregationsArgToQueryParamAndTypes() camelToFieldObj:%s', toStr(camelToFieldObj));
	//log.debug('aggregationsArgToQueryParamAndTypes() -> repoQueryAggregationsObj:%s', toStr(repoQueryAggregationsObj));
	//log.debug('aggregationsArgToQueryParamAndTypes() -> typesObj:%s', toStr(typesObj));
	return [repoQueryAggregationsObj, typesObj];
}
