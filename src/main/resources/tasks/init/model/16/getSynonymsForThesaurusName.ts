import type {WriteConnection} from '/lib/explorer/types/index.d';


import {NT_SYNONYM} from '/lib/explorer/constants';


export function getSynonymsForThesaurusName({
	thesaurusName,
	writeConnection
} :{
	thesaurusName :string
	writeConnection :WriteConnection
}) {
	return writeConnection.query({
		count: -1, // TODO Paginate...
		filters: {
			boolean: {
				should: [{
					exists: {
						field: 'from'
					}
				},{
					exists: {
						field: 'to'
					}
				}]
			}
		},
		query: {
			boolean: {
				must: [{
					term: {
						field: '_nodeType',
						value: NT_SYNONYM
					}
				},{
					term: {
						field: '_parentPath',
						value: `/thesauri/${thesaurusName}`
					}
				}]
			}
		},
		sort: null
	}).hits;
}
