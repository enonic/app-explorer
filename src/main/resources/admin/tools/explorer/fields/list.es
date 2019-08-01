import {toStr} from '/lib/util';

import {
	DEFAULT_FIELDS,
	NO_VALUES_FIELDS,
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {fieldFormHtml} from '/admin/tools/explorer/fields/fieldFormHtml';
import {getFields} from '/admin/tools/explorer/fields/getFields';
import {getFieldValues} from '/admin/tools/explorer/fields/getFieldValues';
import {menu} from '/admin/tools/explorer/fields/menu';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {connect} from '/lib/explorer/repo/connect';


export function list({
	params: {
		messages,
		status
	},
	path
}) {
	const connection = connect({principals: PRINCIPAL_EXPLORER_READ});
	const defaultFields = DEFAULT_FIELDS.map(({_name})=>_name);
	const noValuesFields = NO_VALUES_FIELDS.map(({_name})=>_name);
	const fieldRows = getFields({connection}).hits.map(({
		_id: id,
		_name: name,
		displayName,
		//description,
		fieldType,
		indexConfig,
		key
	}) => {
		return `<tr>
		<td>${key}</td>
		<td>${displayName}</td>
		<td>${fieldType}</td>
		<!--td>${toStr(indexConfig)}</td-->
		<td>${getFieldValues({
		connection,
		field: name
	}).hits.map(({displayName: vN}) => vN).join(', ')}</td>
		<td>
			${noValuesFields.includes(name) ? '' : `
				<a class="tiny compact ui button" href="${TOOL_PATH}/fields/edit/${name}"><i class="blue edit icon"></i>Edit</a>
			`}
			${defaultFields.includes(name) ? '' : `
				<a class="tiny compact ui button" href="${TOOL_PATH}/fields/delete/${name}"><i class="red trash alternate outline icon"></i>Delete</a>
			`}
		</td>
	</tr>`;
	}).join('\n');
	return htmlResponse({
		main: `<h1 class="ui header">Fields</h1>
${menu({path})}
<table class="collapsing compact ui sortable selectable celled striped table">
	<thead>
		<tr>
			<th class="sorted ascending">Key</th>
			<th>Display name</th>
			<th>Type</th>
			<!--th>IndexConfig</th-->
			<th>Values</th>
			<th class="no-sort">Actions</th>
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
