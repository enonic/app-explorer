import type {
	AnyObject,
	InterfaceField
} from '/lib/explorer/types/index.d';
import type {Highlight} from '../../highlight/input/index.d';


import {
	addQueryFilter,
	forceArray//,
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
import {getSynonymsFromSearchString} from '/lib/explorer/synonym/getSynonymsFromSearchString';
import {flattenSynonyms} from '/lib/explorer/synonym/flattenSynonyms';
import {
	createAggregation,
	createFilters
	//@ts-ignore
} from '/lib/guillotine/util/factory';
import {makeQuery} from './makeQuery';
import {
	highlightGQLArgToEnonicXPQuery
} from '../../highlight/input/highlightGQLArgToEnonicXPQuery';
import {resolveFieldShortcuts} from './resolveFieldShortcuts';


export function makeQueryParams({
	aggregationsArg,
	count,
	fields,
	filtersArg,
	highlightArg,
	searchString = '',
	start,
	stopWords,
	thesauriNames
} :{
	aggregationsArg :Array<AnyObject>
	count ?:number
	fields :Array<InterfaceField>
	filtersArg ?:Array<AnyObject>
	highlightArg ?:Highlight
	searchString :string
	start ?:number
	stopWords :Array<string>
	thesauriNames :Array<string>
}) {
	//log.debug('makeQueryParams highlightArg:%s', toStr(highlightArg));

	const aggregations = {};
	if (aggregationsArg) {
		//log.debug('makeQueryParams aggregationsArg:%s', toStr(aggregationsArg));
		forceArray(resolveFieldShortcuts({
			basicObject: aggregationsArg
		})).forEach(aggregation => {
			// This works magically because fieldType is an Enum.
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
		// This works magically because fieldType is an Enum?
		filtersArray = createFilters(resolveFieldShortcuts({
			basicObject: filtersArg
		}));
		//log.debug('filtersArray:%s', toStr(filtersArray));
		filtersArray.push(staticFilter as unknown as AnyObject);
		//log.debug('filtersArray:%s', toStr(filtersArray));
	}

	const explorerRepoReadConnection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });

	const washedSearchString = wash({string: searchString});
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

	const synonyms = getSynonymsFromSearchString({
		//expand,
		//explain,
		explorerRepoReadConnection,
		searchString: searchStringWithoutStopWords,
		showSynonyms: true,
		thesauri: thesauriNames
	});
	//log.debug('synonyms:%s', toStr(synonyms));

	const flattenedSynonyms = flattenSynonyms({
		//expand,
		synonyms
	}).map(s => `${s}`); // Removed double quotes https://enonic.zendesk.com/agent/tickets/3714
	//log.debug('flattenedSynonyms:%s', toStr(flattenedSynonyms));

	//log.debug('fields:%s', toStr(fields));
	const query = makeQuery({
		fields,
		searchStringWithoutStopWords
	});
	//log.debug('query:%s', toStr(query));

	if (flattenedSynonyms) {
		for (let i = 0; i < flattenedSynonyms.length; i++) {
			//log.debug(`flattenedSynonyms[${i}]:%s`, flattenedSynonyms[i]);
			//log.debug('before query.boolean.should:%s', toStr(query.boolean.should));
			const aSynonymQuery = {
				fulltext: {
					fields: fields.map(({name}) => name), // NOTE: No boosting
					operator: 'AND',
					query: flattenedSynonyms[i]
				}
			};
			//log.debug('aSynonymQuery:%s', toStr(aSynonymQuery));
			//@ts-ignore // We know it's a list
			query.boolean.should.push(aSynonymQuery);
			//log.debug('after query.boolean.should:%s', toStr(query.boolean.should));
		} // for flattenedSynonyms
	}
	//log.debug('query:%s', toStr(query));

	return {
		queryParams: {
			aggregations,
			count,
			filters: filtersArray ? filtersArray : staticFilter,
			highlight: highlightArg
				? highlightGQLArgToEnonicXPQuery({highlightArg})
				: null,
			query,
			start,
		},
		synonyms
	};
}