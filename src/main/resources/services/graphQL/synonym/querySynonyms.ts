import type {QueryFilters} from '/lib/explorer/types/index.d';


import {PRINCIPAL_EXPLORER_READ} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as qS} from '/lib/explorer/synonym/query';
import {coerseSynonymType} from '/lib/explorer/synonym/coerseSynonymType';


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
	//log.info(`filters:${toStr(filters)}`);
	const connection = connect({ principals: [PRINCIPAL_EXPLORER_READ] });
	const synonymsRes = qS({
		connection,
		count,
		filters,
		//highlight, // TODO?
		query,
		sort,
		start
	});
	//log.debug(`synonymsRes:${toStr(synonymsRes)}`);
	synonymsRes.hits = synonymsRes.hits.map((item) => coerseSynonymType(item));

	//log.debug(`synonymsRes:${toStr(synonymsRes)}`);
	return synonymsRes;
}
