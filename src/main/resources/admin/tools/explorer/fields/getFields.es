import {NT_FIELD} from '/lib/explorer/model/2/constants';


export function getFields({
	connection // Connecting many places leeds to loss of control over principals, so pass a connection around.
} = {}) {
	const queryParams = {
		count: -1,
		filters: {
			boolean: {
				must: [{
					hasValue: {
						field: 'type',
						values: [NT_FIELD]
					}
				}]
			}
		},
		query: '', //"_parentPath = '/fields'",
		sort: '_name ASC'
	};
	const queryRes = connection.query(queryParams);
	queryRes.hits = queryRes.hits.map(hit => connection.get(hit.id));
	return queryRes;
}
