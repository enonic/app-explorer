//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {serviceUrl} from '/lib/xp/portal';

import {
	NT_SYNONYM,
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {thesaurusForm} from '/admin/tools/explorer/thesauri/thesaurusForm';
import {connect} from '/lib/explorer/repo/connect';

import {query as querySynonyms} from '/lib/explorer/synonym/query';


const ID_REACT_THESAURI_CONTAINER = 'reactThesauriContainer';


export function newOrEdit({
	params: {
		messages,
		status
	},
	path
}) {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	const action = pathParts[1];
	const thesaurusName = pathParts[2];

	if(action !== 'edit') {
		return htmlResponse({
			main: thesaurusForm(),
			messages,
			path,
			status,
			title: 'New'
		});
	}

	const propsObj = {
		serviceUrl: serviceUrl({
			service: 'thesauri'
		}),
		thesauri: [thesaurusName],
		TOOL_PATH
	};
	const propsJson = JSON.stringify(propsObj);

	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});
	const thesaurusNode = connection.get(`/thesauri/${thesaurusName}`);
	//log.info(toStr({thesaurusNode}));

	const {displayName, description} = thesaurusNode;
	//log.info(toStr({displayName, description}));

	/*const synonyms = querySynonyms({
		connection,
		query: `_parentPath = '/thesauri/${thesaurusName}'`
	}).hits;*/

	return htmlResponse({
		bodyEnd: [
			`<script type="text/javascript">
	ReactDOM.render(
		React.createElement(window.explorer.Thesauri, ${propsJson}),
		document.getElementById('${ID_REACT_THESAURI_CONTAINER}')
	);
</script>`],
		main: `${thesaurusForm({
			description,
			displayName,
			name: thesaurusName
		})}
		<a class="ui button" href="${TOOL_PATH}/thesauri/synonyms/${thesaurusName}/new"><i class="green plus icon"></i> New synonym</a>
		<div id="${ID_REACT_THESAURI_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: `Edit thesaurus ${displayName}`
	});
} // newOrEdit

/*
<table class="collapsing compact ui sortable selectable celled striped table">
	<thead>
		<tr>
			<!--th>Display name</th-->
			<th>From</th>
			<th colspan="2">To</th>
		</tr>
	</thead>
	<tbody>
${synonyms.map(s => `<tr>
<!--td>${s.displayName}</td-->
<td>${forceArray(s.from).join('<br/>')}</td>
<td>${forceArray(s.to).join('<br/>')}</td>
<td>
<a class="ui button" href="${TOOL_PATH}/thesauri/synonyms/${thesaurusName}/edit/${s.name}"><i class="blue edit icon"></i> Edit</a>
<a class="ui button" href="${TOOL_PATH}/thesauri/synonyms/${thesaurusName}/delete/${s.name}"><i class="red trash alternate outline icon"></i> Delete</a>
</td>
</tr>`).join('\n')}
</tbody>
</table>
*/
