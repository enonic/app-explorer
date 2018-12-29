import {NT_FIELD} from '/lib/enonic/yase/admin/constants';
import {connectRepo} from '/lib/enonic/yase/admin/connectRepo';
import {htmlResponse} from '/lib/enonic/yase/admin/htmlResponse';
import {fieldFormHtml} from '/lib/enonic/yase/admin/routes/fields/fieldFormHtml';


export function getFields({
	connection = connectRepo()
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


export function fieldsPage({
	path
}, {
	messages,
	status
} = {}) {
	const fieldRows = getFields().hits.map(({
		comment,
		displayName,
		description,
		indexConfig,
		key,
		...rest
	}) => {
		const indexConfigStr = indexConfig === 'custom'
			? [
				'decideByType',
				'enabled',
				'nGram',
				'fulltext',
				'includeInAllText',
				'path'
			].map(k => rest[k] ? k : '').filter(x => x).join(', ') // eslint-disable-line no-confusing-arrow
			: indexConfig;
		return `<tr>
		<td>${displayName}</td>
		<td>${key}</td>
		<td>${description}</td>
		<td>${indexConfigStr}</td>
		<td>${comment}</td>
	</tr>`;
	}).join('\n');
	return htmlResponse({
		main: `${fieldFormHtml()}
<table>
	<thead>
		<tr>
			<th>Display name</th>
			<th>Key</th>
			<th>Description</th>
			<th>IndexConfig</th>
			<th>Comment</th>
		</tr>
	</thead>
	<tbody>
		${fieldRows}
	</tbody>
</table>`,
		messages,
		path,
		status,
		title: 'Fields'
	});
}
