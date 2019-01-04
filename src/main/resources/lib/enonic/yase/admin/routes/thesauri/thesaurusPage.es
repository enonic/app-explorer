import {NT_SYNONYM, TOOL_PATH} from '/lib/enonic/yase/admin/constants';
import {htmlResponse} from '/lib/enonic/yase/admin/htmlResponse';
import {insertAdjacentHTML} from '/lib/enonic/yase/admin/insertAdjacentHTML';
import {connectRepo} from '/lib/enonic/yase/admin/connectRepo';

import {forceArray} from '/lib/enonic/util/data';


function getThesaurus({name}) {
	const connection = connectRepo();
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


export function thesaurusPage({
	path
}, {
	messages,
	status
} = {}) {
	const name = path.replace(`${TOOL_PATH}/thesauri/`, '');
	const fromInput = '<input class="block" name="from" type="text"/>';
	const toInput = '<input class="block" name="to" type="text"/>';
	return htmlResponse({
		main: `<h1>${name}</h1>
<form action="${path}" autocomplete="off" method="POST">
	<fieldset>
		<legend>Synonym</legend>
		<label>
			<span>From</span>
			${fromInput}
			<button type="button" onClick="${insertAdjacentHTML(fromInput)}">+</button>
		</label>
		<label>
			<span>To</span>
			${toInput}
			<button type="button" onClick="${insertAdjacentHTML(toInput)}">+</button>
		</label>
		<button type="submit">Save synonym</button>
	</fieldset>
</form>
<table>
	<thead>
		<tr>
			<th>Display name</th>
			<th>From</th>
			<th>To</th>
		</tr>
	</thead>
	<tbody>
		${getThesaurus({name}).map(s => `<tr>
	<td>${s.displayName}</td>
	<td>${forceArray(s.from).join('<br/>')}</td>
	<td>${forceArray(s.to).join('<br/>')}</td>
	<td><a href="${TOOL_PATH}/thesauri/${name}/${s.id}">Edit</a></td>
</tr>`).join('\n')}
	</tbody>
</table>`,
		messages,
		path,
		status,
		title: `${name} - Thesaurus`
	});
}
