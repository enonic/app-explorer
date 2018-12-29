import {phrasesQuery} from '/lib/enonic/phrases/phrasesQuery';
//import {toStr} from '/lib/enonic/util';


import {NT_TAG, TOOL_PATH} from '/lib/enonic/yase/admin/constants';
import {connectRepo} from '/lib/enonic/yase/admin/connectRepo';
import {htmlResponse} from '/lib/enonic/yase/admin/htmlResponse';


export function getTags({
	connection = connectRepo()
} = {}) {
	const queryParams = {
		count: -1,
		filters: {
			boolean: {
				must: [{
					hasValue: {
						field: 'type',
						values: [NT_TAG]
					}
				}]
			}
		},
		query: '', //"_parentPath = '/tags'",
		sort: '_path ASC'
	};
	const queryRes = connection.query(queryParams);
	queryRes.hits = queryRes.hits.map(hit => connection.get(hit.id));
	return queryRes;
}


export function tagsPage(
	{
		params: {
			_parentPath = '/tags'
		},
		path
	},
	{
		messages,
		status
	} = {}
) {
	const phrases = phrasesQuery().hits;
	//log.info(toStr({phrases}));

	const fieldRows = getTags().hits.map(({
		_path
	}) => `<tr>
		<td>${_path.replace(/^\/tags/, '')}</td>
		<td><button onClick="document.getElementById('_parentPath')">Create child tag</button></td>
	</tr>`).join('\n');

	return htmlResponse({
		main: `<form action="${TOOL_PATH}/tags" autocomplete="off" method="POST">
	<fieldset>
		<legend>New tag</legend>
		<label>
			<span>Parent path</span>
			<input id="_parentPath" name="_parentPath" readonly tabIndex="-1" type="text" value="${_parentPath}"/>
		</label>

		<label>
			<span>Name</span>
			<input name="name" type="text"/>
		</label>

		<label>
			<span>Phrase</span>
			<select name="phrase">
				${phrases.map(phrase => `<option value="${phrase.id}">${phrase.displayName}</option>`)}
			</select>
		</label>

		<button type="submit">Add tag</button>
	</fieldset>
</form>
<table>
	<thead>
		<tr>
			<th>Tag</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		${fieldRows}
	</tbody>
	</table>`,
		messages,
		path,
		status,
		title: 'Tags'
	});
}
