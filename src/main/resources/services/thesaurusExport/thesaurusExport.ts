import {
	NT_SYNONYM,
	PRINCIPAL_EXPLORER_READ
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';


function getThesaurus({name}) {
	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});
	const queryParams = {
		count: -1,
		filters: {
			boolean: {
				must: [{
					hasValue: {
						field: 'type',
						values: [NT_SYNONYM]
					}
				}]
			}
		},
		query: `_parentPath = '/thesauri/${name}'`,
		sort: '_name ASC'
	};
	const queryRes = connection.query(queryParams);
	const thesaurus = queryRes.hits.map((hit) => {
		const {
			_name, displayName, from, to
		} = connection.get(hit.id);
		return {
			displayName, from, id: hit.id, name: _name, to
		};
	});
	return thesaurus;
}


export function get({
	params: {
		name
	}
}) {
	const thesaurus = getThesaurus({name});
	return {
		body: `"From","To"${thesaurus.map(s => `\n"${Array.isArray(s.from) ? s.from.join(', ') : s.from}","${Array.isArray(s.to) ? s.to.join(', ') : s.to}"`).join('')}\n`,
		contentType: 'text/csv;charset=utf-8',
		headers: {
			'Content-Disposition': `attachment; filename="${name}.csv"`
		}
	};
} // get
