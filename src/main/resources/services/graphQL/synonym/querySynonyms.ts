import type {
	QueryDSL,
	SortDSLExpression
} from '@enonic/js-utils/src/types';
import type {AggregationsResponseEntry} from '@enonic/js-utils/src/types/node/query/Aggregation.d';
import type {
	Highlight,
	QueryFilters,
	QueriedSynonym
} from '@enonic-types/lib-explorer';


import { Principal } from '@enonic/explorer-utils';
//import {toStr} from '@enonic/js-utils';
import {connect} from '/lib/explorer/repo/connect';
import {query as qS} from '/lib/explorer/synonym/query';


export function querySynonyms({
	count, // NOTE: lib-explorer/synonym/query defaults to -1
	filters = {},
	highlight = {},
	query = '',
	sort = '_name ASC',
	start = 0
} :{
	count ?:number
	filters ?:QueryFilters
	highlight ?:Highlight
	query ?:QueryDSL|string
	sort ?:SortDSLExpression|string
	start ?:number
}) {
	/*log.debug('querySynonyms(%s)', toStr({
		count,
		filters,
		query,
		sort,
		start
	}));*/
	const connection = connect({ principals: [Principal.EXPLORER_READ] });
	const synonymsRes = qS<'thesaurus'>({
		connection,
		count,
		filters,
		highlight,
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

	const aggQueryParams = {
		connection,
		aggregations: {
			thesaurus: {
				terms: {
					field: '_parentPath',
					order: '_count desc',
					size: 0, // Seems to mean infinite (undocumented)
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
