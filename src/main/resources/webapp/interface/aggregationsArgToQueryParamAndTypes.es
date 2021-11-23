export function aggregationsArgToQueryParamAndTypes({
	aggregationsArray = [],
	camelToFieldObj
}) {
	//log.debug(`aggregationsArray:${toStr(aggregationsArray)}`);
	const aggregationsObj = {};
	const typesObj = {};
	//log.debug(`aggregationsArray:${toStr(aggregationsArray)}`);
	aggregationsArray.forEach(({
		name,
		subAggregations,
		...rest
	}) => {
		//log.debug(`rest:${toStr(rest)}`);
		/*if (isSet(aggregations[name])) {
			// TODO Throw GraphQLError
		}*/
		typesObj[name] = { type: Object.keys(rest)[0] };
		if (rest[Object.keys(rest)[0]].field) {
			// TODO Workaround related to https://github.com/enonic/app-explorer/issues/275
			rest[Object.keys(rest)[0]].field = camelToFieldObj[rest[Object.keys(rest)[0]].field];
		}
		aggregationsObj[name] = rest;
		if (subAggregations) {
			[
				aggregationsObj[name].aggregations,
				typesObj[name].types
			] = aggregationsArgToQueryParamAndTypes({
				aggregationsArray: subAggregations,
				camelToFieldObj
			}); // recurse
		}
	});
	return [aggregationsObj, typesObj];
}
