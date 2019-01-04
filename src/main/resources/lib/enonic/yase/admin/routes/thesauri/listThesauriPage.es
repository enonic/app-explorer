import {NT_THESAURUS, TOOL_PATH} from '/lib/enonic/yase/admin/constants';
import {connectRepo} from '/lib/enonic/yase/admin/connectRepo';
import {htmlResponse} from '/lib/enonic/yase/admin/htmlResponse';


function getThesauri() {
	const connection = connectRepo();
	const queryParams = {
		count: -1,
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
		query: '', //"_parentPath = '/thesauri'",
		sort: '_name ASC'
	};
	const queryRes = connection.query(queryParams);
	const thesauri = queryRes.hits.map((hit) => {
		const {_name: name, displayName} = connection.get(hit.id);
		return {displayName, name};
	});
	return thesauri;
}


export function listThesauriPage(
	{path} = {},
	{messages, status} = {}
) {
	return htmlResponse({
		main: `<form action="${TOOL_PATH}/thesauri" autocomplete="off" method="POST">
	<fieldset>
		<legend>New thesaurus</legend>
		<label>
			<span>Name</span>
			<input name="name" type="text"/>
		</label>
		<button type="submit">Add thesaurus</button>
	</fieldset>
</form>
<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Display name</th>
			<th>Synonyms count</th>
		</tr>
	</thead>
	<tbody>
		${getThesauri().map(t => `<tr>
			<td><a href="${TOOL_PATH}/thesauri/${t.name}">${t.name}</a></td>
			<td>${t.displayName}</td>
		</tr>`)}
	</tbody>
</table>`,
		messages,
		path,
		status,
		title: 'Thesauri'
	});
}
