import serialize from 'serialize-javascript';

//import {toStr} from '/lib/util';
import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
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
		servicesBaseUrl: serviceUrl({service: ''}),
		serviceUrl: serviceUrl({
			service: 'thesauri'
		}),
		TOOL_PATH
	};

	return htmlResponse({
		bodyEnd: [
			`<script type='module' defer>
	import {Thesauri} from '${assetUrl({path: 'react/Thesauri.esm.js'})}';
	const propsObj = eval(${serialize(propsObj)});
	ReactDOM.render(
		React.createElement(Thesauri, propsObj),
		document.getElementById('${ID_REACT_THESAURI_CONTAINER}')
	);
</script>`],
		main: `<h1 class="ui header">Thesauri</h1>
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
				<a class="tiny compact ui button" href="${TOOL_PATH}/thesauri/import/${t.name}"><i class="blue upload icon"></i>Import</a>
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
