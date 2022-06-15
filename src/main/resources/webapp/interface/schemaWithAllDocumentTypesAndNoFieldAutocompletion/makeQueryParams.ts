import type {
	AnyObject,
	InterfaceField
} from '/lib/explorer/types/index.d';


import {addQueryFilter} from '@enonic/js-utils';
import {
	NT_DOCUMENT,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/constants';
import {connect} from '/lib/explorer/repo/connect';
import {hasValue} from '/lib/explorer/query/hasValue';
import {removeStopWords} from '/lib/explorer/query/removeStopWords';
import {wash} from '/lib/explorer/query/wash';
import {get as getStopWordsList} from '/lib/explorer/stopWords/get';
import {makeQuery} from './makeQuery';


export function makeQueryParams({
	fields,
	filters = {},
	searchString = '',
	stopWords
} :{
	fields :Array<InterfaceField>
	filters :AnyObject
	searchString :string
	stopWords :Array<string>
}) {
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
		filters: addQueryFilter({
			filter: hasValue('_nodeType', [NT_DOCUMENT]),
			filters
		}),
		query
	};
}
