import {
	QUERY_FUNCTION_FULLTEXT,
	QUERY_FUNCTION_NGRAM//,
	//toStr
} from '@enonic/js-utils';

import {PRINCIPAL_EXPLORER_READ, RT_JSON} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {addFilter} from '/lib/explorer/query/addFilter';
import {hasValue} from '/lib/explorer/query/hasValue';
import {query as querySynonyms} from '/lib/explorer/synonym/query';


export function get({
	params = {}
}) {
	//log.info(`service thesauri get params:${toStr(params)}`);
	const {
		from,
		to,
		page = 1, // NOTE First index is 1 not 0
		perPage = 10,
		//query = '',
		//sort = 'from ASC',
		sort = '_score DESC',
		thesauri = ''
	} = params;
	const intPerPage = parseInt(perPage, 10);
	const intPage = parseInt(page, 10);
	const start = (intPage - 1 ) * intPerPage;

	const queries = [];
	if (from) {
		queries.push(`(${QUERY_FUNCTION_FULLTEXT}('from^2', '${from}', 'AND') OR ${QUERY_FUNCTION_NGRAM}('from^1', '${from}', 'AND'))`);
	}
	if (to) {
		queries.push(`(${QUERY_FUNCTION_FULLTEXT}('to^2', '${to}', 'AND') OR ${QUERY_FUNCTION_NGRAM}('to^1', '${to}', 'AND'))`);
	}
	const query = queries.length ? `(${queries.join(' OR ')})` : '';

	const filters = {};
	const thesauriArr = thesauri.split(',');
	if(thesauri) {
		thesauriArr.forEach(thesaurus => {
			addFilter({
				clause: 'should',
				filters,
				filter: hasValue('_parentPath', `/thesauri/${thesaurus}`)
			});
		});
	}

	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});
	const count = intPerPage;
	const queryParams = {
		connection,
		count,
		filters,
		query,
		sort,
		start
	};
	//log.info(`service thesauri get queryParams:${toStr(queryParams)}`);
	const result = querySynonyms(queryParams);
	//log.info(`service thesauri get result:${toStr(result)}`);
	result.page = intPage;
	result.start = start + 1;
	result.end = Math.min(start + intPerPage, result.total);
	result.totalPages = Math.ceil(result.total / intPerPage);

	const aggregations = {
		thesaurus: {
			terms: {
				field: '_parentPath',
				order: '_count desc',
				size: 100
			}
		}
	};
	const aggQueryParams = {
		connection,
		aggregations,
		count: 0,
		filters: {},
		query
	};
	//log.info(`service thesauri get aggQueryParams:${toStr(aggQueryParams)}`);
	const thesauriAggRes = querySynonyms(aggQueryParams);
	//log.info(`service thesauri get thesauriAggRes:${toStr(thesauriAggRes)}`);
	result.aggregations.thesaurus = thesauriAggRes.aggregations.thesaurus;

	return {
		contentType: RT_JSON,
		body: {
			serviceParams: {
				from,
				page: intPage,
				perPage: intPerPage,
				sort
			},
			queryParams: {
				aggregations,
				count,
				filters,
				query,
				//sort,
				start
			},
			queryResult: result
		}
	};
}
