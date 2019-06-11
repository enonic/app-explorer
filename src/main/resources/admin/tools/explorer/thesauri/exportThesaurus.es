import {
	NT_SYNONYM,
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
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


export function exportThesaurus({
	path
}) {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const action = pathParts[1];
	const fileName = pathParts[2];

	const [match, name, dotExtension] = fileName.match(/^(.*?)(\.csv)?$/); // eslint-disable-line no-unused-vars
	//log.info(toStr({match, name, dotExtension}));
	if (dotExtension === '.csv') {
		const thesaurus = getThesaurus({name});
		return {
			body: `"From","To"${thesaurus.map(s => `\n"${Array.isArray(s.from) ? s.from.join(', ') : s.from}","${Array.isArray(s.to) ? s.to.join(', ') : s.to}"`).join('')}\n`,
			contentType: 'text/csv;charset=utf-8',
			headers: {
				'Content-Disposition': `attachment; filename="${name}.csv"`
			}
		};
	}
} // exportThesaurus
