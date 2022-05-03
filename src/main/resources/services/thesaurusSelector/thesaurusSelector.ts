import {
	QUERY_FUNCTION_FULLTEXT,
	QUERY_FUNCTION_NGRAM,
	toStr
} from '@enonic/js-utils';

//@ts-ignore
import {connect} from '/lib/xp/node';

import {
	BRANCH_ID_EXPLORER,
	NT_THESAURUS,
	REPO_ID_EXPLORER
} from '/lib/explorer/model/2/constants';


const CONNECTION = connect({
	repoId: REPO_ID_EXPLORER,
	branch: BRANCH_ID_EXPLORER
});


function getThesauri(key) {
	//log.info(toStr({key}));
	const node = CONNECTION.get(key);
	//log.info(toStr({node}));
	const {_name: id, displayName, description} = node;
	return {id, displayName, description};
}


export function get({
	params: {
		count,
		ids = '[]', // NOTE Json
		query = '',
		start
	}
}) {
	log.info(toStr({
		count, ids, query, start
	}));
	if (ids) {
		const idArray = JSON.parse(ids);
		if (idArray.length) {
			return {
				body: {
					count: ids.length,
					total: ids.length,
					hits: idArray.map(id => getThesauri(`/thesauri/${id}`))
				},
				contentType: 'text/json; charset=utf-8'
			};
		}
	} // if ids
	const queryParams = {
		count,
		filters: {
			boolean: {
				must: [{
					hasValue: {
						field: 'type',
						values: [NT_THESAURUS]
					}
				}]
			}
		},
		query: query
			.split(' ')
			.map(word => `(
				${QUERY_FUNCTION_FULLTEXT}('_name^7, displayName^5, description^3, _allText^1', '${word}', 'OR')
				OR ${QUERY_FUNCTION_NGRAM}('_name^6, displayName^4, description^2, _allText', '${word}', 'OR')
			)`)
			.join(' AND ')
			.replace(/\n\s*/g, ' ')
			.trim(),
		start
	}; //log.info(toStr({queryParams}));
	const result = CONNECTION.query(queryParams); //log.info(toStr({result}));
	const body = {
		count: result.count,
		total: result.total,
		hits: result.hits.map(({id}) => getThesauri(id))
	}; //log.info(toStr({body}));
	return {
		body,
		contentType: 'text/json; charset=utf-8'
	};
}
