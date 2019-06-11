import {NT_FIELD_VALUE} from '/lib/explorer/model/2/constants';


export function getFieldValues({
	connection, // Connecting many places leeds to loss of control over principals, so pass a connection around.
	field
} = {}) {
	const must = [{
		hasValue: {
			field: 'type',
			values: [NT_FIELD_VALUE]
		}
	}];
	if (field) {
		must.push({
			hasValue: {
				field: '_parentPath',
				values: [`/fields/${field}`]
			}
		}/*{
			hasValue: {
				field: 'field',
				values: [field]
			}
		}*/);
	}
	const queryParams = {
		count: -1,
		filters: {
			boolean: {
				must
			}
		},
		query: '',
		sort: '_name ASC'
	};
	const queryRes = connection.query(queryParams);
	queryRes.hits = queryRes.hits.map(hit => connection.get(hit.id));
	return queryRes;
}
