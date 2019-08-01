//import {toStr} from '/lib/util';
import {serviceUrl} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {menu} from '/admin/tools/explorer/thesauri/menu';
import {connect} from '/lib/explorer/repo/connect';
import {query as getThesauri} from '/lib/explorer/thesaurus/query';


const ID_REACT_THESAURI_CONTAINER = 'reactThesauriContainer';


export function list({
	params: {
		messages,
		status
	},
	path
}) {
	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});
	const {hits: thesauri} = getThesauri({connection});
	//log.info(toStr({thesauri}));
	const total = thesauri.length ? thesauri
		.map(({synonymsCount}) => synonymsCount)
		.reduce((accumulator, currentValue) => accumulator + currentValue) : 0;

	const propsObj = {
		serviceUrl: serviceUrl({
			service: 'thesauri'
		}),
		TOOL_PATH
	};
	const propsJson = JSON.stringify(propsObj);

	return htmlResponse({
		bodyEnd: [
			`<script type="text/javascript">
	ReactDOM.render(
		React.createElement(window.explorer.Thesauri, ${propsJson}),
		document.getElementById('${ID_REACT_THESAURI_CONTAINER}')
	);
</script>`],
		main: `<h1 class="ui header">Thesauri</h1>
${menu({path})}
<table class="collapsing compact ui sortable selectable celled striped table">
	<thead>
		<tr>
			<th>Display name</th>
			<th>Synonyms</th>
			<th>Actions</th>
		</tr>
	</thead>
	<tbody>
		${thesauri.map(t => `<tr>
			<td>${t.displayName}</td>
			<td>${t.synonymsCount}</td>
			<td>
				<a class="tiny compact ui button" href="${TOOL_PATH}/thesauri/edit/${t.name}"><i class="blue edit icon"></i> Edit</a>
				<a class="tiny compact ui button" href="${TOOL_PATH}/thesauri/delete/${t.name}"><i class="red trash alternate outline icon"></i>Delete</a>
				<a class="tiny compact ui button" href="${TOOL_PATH}/thesauri/import/${t.name}"><i class="blue upload icon"></i>Import</a>
				<a class="tiny compact ui button" href="${TOOL_PATH}/thesauri/export/${t.name}.csv"><i class="blue download icon"></i> ${t.name}.csv</a>
			</td>
		</tr>`).join('\n')}
	</tbody>
	<tfoot>
		<tr>
			<th></th>
			<th>${total}</th>
			<th></th>
		</tr>
	</tfoot>
</table>
<div id="${ID_REACT_THESAURI_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: 'Thesauri'
	});
}
