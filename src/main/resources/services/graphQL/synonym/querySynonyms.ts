import type {AggregationsResponseEntry} from '@enonic/js-utils/src/types/node/query/Aggregation.d';
import type {QueriedSynonym} from '/lib/explorer/types/index.d';
import type {QueryFilters} from '/lib/explorer/types/index.d';


//import {toStr} from '@enonic/js-utils';
import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as qS} from '/lib/explorer/synonym/query';
import {coerceSynonymType} from '/lib/explorer/synonym/coerceSynonymType';


export function querySynonyms({
	count, // NOTE: lib-explorer/synonym/query defaults to -1
	filters = {},
	//highlight, // TODO?
	query = '',
	sort = '_name ASC',
	start = 0
} :{
	count ?:number
	filters ?:QueryFilters
	query ?:string
	sort ?:string
	start ?:number
}) {
	/*log.debug('querySynonyms(%s)', toStr({
		count,
		filters,
		query,
		sort,
		start
	}));*/
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const synonymsRes = qS<'thesaurus'>({
		connection,
		count,
		filters,
		//highlight, // TODO?
		query,
		sort,
		start
	}) as {
		aggregations ?:{
			thesaurus :AggregationsResponseEntry
		}
		count :number
		hits: Array<QueriedSynonym>
		total :number
	};
	//log.debug('synonymsRes1:%s', toStr(synonymsRes));

	synonymsRes.hits = synonymsRes.hits.map((item) => coerceSynonymType(item));
	//log.debug('synonymsRes2:%s', toStr(synonymsRes));

	const aggQueryParams = {
		connection,
		aggregations: {
			thesaurus: {
				terms: {
					field: '_parentPath',
					order: '_count desc',
					size: 100
				}
			}
		},
		count: 0,
		filters: {},
		query
	};
	//log.debug('aggQueryParams:%s', toStr(aggQueryParams));

	const thesauriAggRes = qS<'thesaurus'>(aggQueryParams);
	//log.debug('thesauriAggRes:%s', toStr(thesauriAggRes));

	synonymsRes.aggregations = {
		thesaurus: {
			buckets: []
		}
	};
	if (
		thesauriAggRes.aggregations // {} is Truthy
		&& thesauriAggRes.aggregations.thesaurus // {} is Truthy
		&& thesauriAggRes.aggregations.thesaurus.buckets // [] is Truthy
	) {
		synonymsRes.aggregations.thesaurus.buckets = thesauriAggRes.aggregations.thesaurus.buckets;
	}

	//log.debug('synonymsRes3:%s', toStr(synonymsRes));
	return synonymsRes;
}
