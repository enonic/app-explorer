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
	AggregationKey extends undefined|string = undefined
>({
	gqlSearchArgAggregationsArray = [],
	camelToFieldObj
} :{
	gqlSearchArgAggregationsArray :Array<GraphQLInterfaceSearchAggregation>,
	camelToFieldObj :CamelToFieldObj
}) :{
	aggregations: Record<AggregationKey, Aggregation>,
	types: AggregationTypesObj
} {
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
			const {
				aggregations,
				types
			} = aggregationsArgToQueryParamAndTypes({
				gqlSearchArgAggregationsArray: subAggregations,
				camelToFieldObj
			}); // recurse
			repoQueryAggregationsObj[name as AggregationKey].aggregations = aggregations;
			typesObj[name].types = types;
		}
	});
	//log.debug('aggregationsArgToQueryParamAndTypes() camelToFieldObj:%s', toStr(camelToFieldObj));
	//log.debug('aggregationsArgToQueryParamAndTypes() -> repoQueryAggregationsObj:%s', toStr(repoQueryAggregationsObj));
	//log.debug('aggregationsArgToQueryParamAndTypes() -> typesObj:%s', toStr(typesObj));
	return {
		aggregations: repoQueryAggregationsObj,
		types: typesObj
	};
}
