//import {toStr} from '/lib/util';
//import {forceArray} from '/lib/util/data';
import {RT_JSON} from '/lib/explorer/model/2/constants';
import {query as queryJournals} from '/lib/explorer/journal/query';
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';


export function get({
	params: {
		collections = '',
		//endTimeRanges,
		showWithoutErrors = 'true',
		page = 1, // NOTE First index is 1 not 0
		perPage = 25,
		sort = 'endTime DESC'
	}
}) {
	const expressions = [];
	//log.info(toStr({collections}));
	const intPerPage = parseInt(perPage, 10);
	const intPage = parseInt(page, 10);
	const start = (intPage - 1 ) * intPerPage;

	const filters = {};

	const collectionsArr = collections.split(',');
	if(collections) {
		addFilter({
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
	});
	result.page = intPage;
	result.start = start + 1;
	result.end = Math.min(start + intPerPage, result.total);
	result.totalPages = Math.ceil(result.total / intPerPage);
	result.hits = result.hits.map(({
		name: collection, startTime, endTime, duration,
		errorCount, successCount//, errors, successes
	}) => ({
		collection, startTime, endTime, duration,
		errorCount, successCount//, errors, successes
	}));
	/*result.aggregations.endTime.buckets = result.aggregations.endTime.buckets.map(({docCount, from, key, to}) => ({
		docCount,
		from: from && from.substring(0, 10),
		key,
		to: to && to.substring(0, 10)
	}));*/

	// Separate aggregation query where the collections filter is not included
	const collectionsAggregationQueryResult = queryJournals({
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
	result.aggregations.collection = collectionsAggregationQueryResult.aggregations.collection;

	return {
		contentType: RT_JSON,
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
