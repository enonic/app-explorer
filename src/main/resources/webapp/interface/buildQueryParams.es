import {addQueryFilter} from '@enonic/js-utils';

import {NT_DOCUMENT} from '/lib/explorer/model/2/constants';
import {hasValue} from '/lib/explorer/query/hasValue';
import {removeStopWords} from '/lib/explorer/query/removeStopWords';
import {wash} from '/lib/explorer/query/wash';
import {get as getStopWordsList} from '/lib/explorer/stopWords/get';

import {aggregationsArgToQueryParamAndTypes} from './aggregationsArgToQueryParamAndTypes';
import {buildQuery} from './buildQuery';


export function buildQueryParams({
	camelToFieldObj,
	env,
	explorerRepoReadConnection,
	fields,
	stopWords
}) {
	const {
		args: {
			aggregations: aggregationsArg = [],
			count = 10,
			filters = {},
			highlight = {},
			searchString = '',
			start = 0
		}
	} = env;
	//log.debug(`aggregationsArg:${toStr(aggregationsArg)}`);
	//log.debug(`filters:${toStr(filters)}`);
	//log.debug(`highlight:${toStr(highlight)}`);

	const [aggregations, types] = aggregationsArgToQueryParamAndTypes({
		aggregationsArray: aggregationsArg,
		camelToFieldObj
	});
	//log.debug(`aggregations:${toStr(aggregations)}`);
	//log.debug(`types:${toStr(types)}`);

	//log.debug(`searchString:${toStr(searchString)}`);
	const washedSearchString = wash({string: searchString});
	//log.debug(`washedSearchString:${toStr({washedSearchString})}`);

	// TODO stopWords could be cached:
	const listOfStopWords = [];
	if (stopWords && stopWords.length) {
		//log.debug(`stopWords:${toStr(stopWords)}`);
		stopWords.forEach((name) => {
			const {words} = getStopWordsList({ // Not a query
				connection: explorerRepoReadConnection,
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
	//log.debug(`searchStringWithoutStopWords:${toStr({searchStringWithoutStopWords})}`);
	//log.debug(`removedStopWords:${toStr({removedStopWords})}`);

	const query = buildQuery({
		fields,
		searchStringWithoutStopWords
	});
	//log.debug(`query:${toStr({query})}`);

	const queryParams = {
		aggregations,
		count,
		filters: addQueryFilter({
			filter: hasValue('_nodeType', [NT_DOCUMENT]),
			filters
		}),
		highlight,
		query,
		start
	};
	//log.debug(`queryParams:${toStr({queryParams})}`);
	return [queryParams, types];
}
