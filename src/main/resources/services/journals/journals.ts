import type {AggregationsResponseEntry} from '@enonic/js-utils/src/types/node/query/Aggregation.d';
//import type {Journal} from '/lib/explorer/journal/types.d';


import {
	RESPONSE_TYPE_JSON,
	addQueryFilter,
	//toStr
} from '@enonic/js-utils';

import {query as queryJournals} from '/lib/explorer/journal/query';
import {hasValue} from '/lib/explorer/query/hasValue';


export function get({
	params: {
		collections = '',
		//endTimeRanges,
		showWithoutErrors = 'true',
		page = '1', // NOTE First index is 1 not 0
		perPage = '25',
		sort = 'endTime DESC'
	} = {}
} : {
	params ?:{
		collections ?:string
		showWithoutErrors ?:'true'|'false'
		page ?:string // number
		perPage ?:string // number
		sort ?:string
	}
} = {}) {
	const expressions = [];
	//log.info(toStr({collections}));
	const intPerPage = parseInt(perPage, 10);
	const intPage = parseInt(page, 10);
	const start = (intPage - 1 ) * intPerPage;

	let filters = {};

	const collectionsArr = collections.split(',');
	if(collections) {
		filters = addQueryFilter({
			filters,
			filter: hasValue('name', collectionsArr)
		});
	}

	/*if (endTimeRanges) {
		const endTimeExpressions = [];
		endTimeRanges.split(',').forEach(range => {
			const [from, to] = range.split(';');
			//log.info(toStr({from, to}));
			const fromInstant = from === '*' ? "''" : `instant('${from}')`;
			const toInstant = to === '*' ? "''" : `instant('${to}')`;
			endTimeExpressions.push(`range('endTime', ${fromInstant}, ${toInstant}, 'true', 'false')`);
		});
		//log.info(toStr({endTimeExpressions}));
		if(endTimeExpressions.length === 1) {
			expressions.push(endTimeExpressions[0]);
		} else if (endTimeExpressions.length > 1) {
			expressions.push(`(${endTimeExpressions.join(' OR ')})`);
		}
	}*/

	const showWithoutErrorsBool = showWithoutErrors === 'true';
	//log.info(toStr({showWithoutErrors, showWithoutErrorsBool}));
	if (!showWithoutErrorsBool) {
		expressions.push('errorCount > 0');
	}

	const query = expressions.length > 1
		? `(${expressions.join(' AND ')})`
		: expressions.length === 1
			? expressions[0]
			: '';
	//log.info(toStr({query}));

	const result = queryJournals({
		/*aggregations: {
			endTime: {
				dateRange: {
					field: 'startTime',
					format: 'yyyy-MM-dd', // Does this give the sort order?
					ranges: [{
						to: 'now-1y'
					}, {
						from: 'now-1y',
						to: 'now-1M'
					}, {
						from: 'now-1M',
						to: 'now-6d'
					}, {
						from: 'now-6d',
						to: 'now-1d'
					}, {
						from: 'now-1d',
						to: 'now'
					}]
				}
			}
		},*/
		count: intPerPage,
		filters,
		query,
		sort,
		start
	}) as unknown as {
		aggregations ?:{
			collection :AggregationsResponseEntry
		}
		count :number
		end :number
		hits :Array<{
			name ?:string
			collection :string
			duration :number
			endTime :number
			errorCount :number
			startTime :number
			successCount :number
		}>
		page :number
		start :number
		total :number
		totalPages :number
	};
	//log.debug('queryJournalsRes:%s', toStr(result));

	result.page = intPage;
	result.start = start + 1;
	result.end = Math.min(start + intPerPage, result.total);
	result.totalPages = Math.ceil(result.total / intPerPage);
	//log.debug('queryJournalsRes:%s', toStr(result));

	result.hits = result.hits.map(({
		name: collection,
		startTime,
		endTime,
		duration,
		errorCount,
		successCount//, errors, successes
	}) => ({
		collection,
		startTime,
		endTime,
		duration,
		errorCount,
		successCount//, errors, successes
	}));
	//log.debug('queryJournalsRes:%s', toStr(result));
	/*result.aggregations.endTime.buckets = result.aggregations.endTime.buckets.map(({docCount, from, key, to}) => ({
		docCount,
		from: from && from.substring(0, 10),
		key,
		to: to && to.substring(0, 10)
	}));*/

	// Separate aggregation query where the collections filter is not included
	const collectionsAggregationQueryResult = queryJournals<'collection'>({
		aggregations: {
			collection: {
				terms: {
        			field: 'name',
        			order: '_count desc',
        			size: 100
      			}
			}
		},
		count: 0,
		filters: {},
		query
	});
	//log.debug('collectionsAggregationQueryResult:%s', toStr(collectionsAggregationQueryResult));
	result.aggregations.collection = collectionsAggregationQueryResult.aggregations.collection;

	return {
		contentType: RESPONSE_TYPE_JSON,
		body: {
			params: {
				collections: collectionsArr,
				//endTimeRanges,
				page: intPage,
				perPage: intPerPage,
				query,
				showWithoutErrors: showWithoutErrorsBool,
				sort
			},
			result
		}
	};
}
