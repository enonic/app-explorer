//import {toStr} from '/lib/util';
import {dlv} from '/lib/util/object';
import {
	BRANCH_ID_EXPLORER,
	DEFAULT_FIELDS,
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH,
	REPO_ID_EXPLORER
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {fieldFormHtml} from '/admin/tools/explorer/fields/fieldFormHtml';
import {fieldValueFormHtml} from '/admin/tools/explorer/fields/values/fieldValueFormHtml';
import {getFieldValues} from '/admin/tools/explorer/fields/getFieldValues';


export function newOrEdit({
	path: reqPath/*,
	params: {
		id,
		name
	}*/
}, {
	messages = [],
	status = 200
} = {}) {
	//log.info(toStr({reqPath}));
	const relPath = reqPath.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));
	const fieldName = pathParts[2]; //log.info(toStr({fieldName}));
	const defaultFields = DEFAULT_FIELDS.map(({_name})=>_name);

	if (fieldName) {
		const connection = connect({
			repoId: REPO_ID_EXPLORER,
			branch: BRANCH_ID_EXPLORER,
			principals: [PRINCIPAL_EXPLORER_READ]
		});
		const path = `/fields/${fieldName}`;
		//log.info(toStr({path}));

		const node = connection.get(path);
		//log.info(toStr({node}));

		const {description, displayName, indexConfig, key} = node;
		//log.info(toStr({description, displayName, key, indexConfig}));

		const fieldForm = defaultFields.includes(fieldName) ? '' : fieldFormHtml({
			//action: `${TOOL_PATH}/fields/update/${fieldName}`,
			description,
			decideByType: dlv(indexConfig, 'decideByType', true),
			displayName,
			enabled: dlv(indexConfig, 'enabled', true),
			fulltext: dlv(indexConfig, 'fulltext', true),
			includeInAllText: dlv(indexConfig, 'includeInAllText', true),
			key,
			ngram: dlv(indexConfig, 'ngram', true),
			path: dlv(indexConfig, 'path', false)
			/*,
			instruction*/
		});

		const values = getFieldValues({
			connection,
			field: fieldName
		}).hits;
		//log.info(toStr({values}));

		const valueForm = fieldValueFormHtml({
			field: fieldName
		});

		return htmlResponse({
			main: `${fieldForm}
<table class="collapsing compact ui sortable selectable celled striped table">
	<thead>
		<tr>
			<th class="sorted ascending">Value</th>
			<th>Display name</th>
			<th class="no-sort">Actions</th>
		</tr>
	</thead>
	<tbody>
		${values.map(({_name: value, displayName: vDN}) => `<tr>
			<td>${value}</td>
			<td>${vDN}</td>
			<td>
				<a class="tiny compact ui button" href="${TOOL_PATH}/fields/values/${fieldName}/edit/${value}"><i class="blue edit icon"></i>Edit</a>
				<form action="${TOOL_PATH}/fields/values/${fieldName}/delete/${value}" method="post">
					<button class="tiny compact ui button" type="submit"><i class="red trash alternate outline icon"></i>Delete</button>
				</form>
			</td>
		</tr>`).join('')}
	</tbody>
</table>
${valueForm}`,
			messages,
			path: reqPath,
			status,
			title: `Edit field ${displayName} `
		});
	}

	return htmlResponse({
		main: fieldFormHtml(),
		messages,
		path: reqPath,
		status,
		title: 'Create field'
	});
} // newOrEdit
