import type {
	AnyObject,
	InterfaceField
} from '/lib/explorer/types/index.d';


import {
	addQueryFilter//,
	//toStr
} from '@enonic/js-utils';
import {
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {hasValue} from '/lib/explorer/query/hasValue';
import {removeStopWords} from '/lib/explorer/query/removeStopWords';
import {wash} from '/lib/explorer/query/wash';
import {get as getStopWordsList} from '/lib/explorer/stopWords/get';
import {
	createAggregation,
	createFilters
	//@ts-ignore
} from '/lib/guillotine/util/factory';
import {makeQuery} from './makeQuery';


export function makeQueryParams({
	aggregationsArg,
	count,
	fields,
	filtersArg,
	searchString = '',
	start,
	stopWords
} :{
	aggregationsArg :Array<AnyObject>
	count ?:number
	fields :Array<InterfaceField>
	filtersArg ?:Array<AnyObject>
	searchString :string
	start ?:number
	stopWords :Array<string>
}) {
	const aggregations = {};
	if (aggregationsArg) {
		aggregationsArg.forEach(aggregation => {
			createAggregation(aggregations, aggregation);
		});
	}

	const staticFilter = addQueryFilter({
		filter: hasValue('_nodeType', [NT_DOCUMENT]),
		filters: {}
	});
	//log.debug('staticFilter:%s', toStr(staticFilter));

	let filtersArray :Array<AnyObject>;
	if (filtersArg) {
		filtersArray = createFilters(filtersArg);
		//log.debug('filtersArray:%s', toStr(filtersArray));
		filtersArray.push(staticFilter as unknown as AnyObject);
		//log.debug('filtersArray:%s', toStr(filtersArray));
	}

	const washedSearchString = wash({string: searchString});
	const listOfStopWords = [];
	if (stopWords && stopWords.length) {
		//log.debug(`stopWords:${toStr(stopWords)}`);
		stopWords.forEach((name) => {
			const {words} = getStopWordsList({ // Not a query
				connection: connect({ principals: [PRINCIPAL_EXPLORER_READ] }),
				name
			});
			//log.debug(`words:${toStr(words)}`);
			words.forEach((word) => {
				if (!listOfStopWords.includes(word)) {
					listOfStopWords.push(word);
				}
			});
		});
	}
	//log.debug(`listOfStopWords:${toStr({listOfStopWords})}`);
	const removedStopWords = [];
	const searchStringWithoutStopWords = removeStopWords({
		removedStopWords,
		stopWords: listOfStopWords,
		string: washedSearchString
	});
	const query = makeQuery({
		fields,
		searchStringWithoutStopWords
	});
	return {
		aggregations,
		count,
		filters: filtersArray ? filtersArray : staticFilter,
		query,
		start
	};
}
