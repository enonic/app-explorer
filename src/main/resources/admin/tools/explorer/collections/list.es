import serialize from 'serialize-javascript';

import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {getDocumentCount} from '/lib/explorer/collection/getDocumentCount';
import {query} from '/lib/explorer/collection/query';
import {usedInInterfaces} from '/lib/explorer/collection/usedInInterfaces';
import {connect} from '/lib/explorer/repo/connect';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {query as queryCollectors} from '/lib/explorer/collector/query';


const ID_REACT_COLLECTIONS_CONTAINER = 'reactCollectionsContainer';


export const list = ({
	params: {
		messages,
		status
	},
	path
}) => {
	const readConnection = connect({principals: PRINCIPAL_EXPLORER_READ});

	const collectorsAppObj = {};
	const collectors = queryCollectors({
		connection: readConnection
	}).hits.map(({_name: application}) => {
		collectorsAppObj[application] = true;
		return {application};
	});
	//log.info(toStr({collectorsAppObj}));

	const collections = query({connection: readConnection});
	//log.info(toStr({collections}));

	const propsObj = {
		servicesBaseUrl: serviceUrl({
			service: ''
		}),
		TOOL_PATH
	};

	return htmlResponse({
		bodyEnd: [`<script type='module' defer>
	import {Collections} from '${assetUrl({path: 'react/Collections.esm.js'})}';
	const propsObj = eval(${serialize(propsObj)});
	ReactDOM.render(
		React.createElement(Collections, propsObj),
		document.getElementById('${ID_REACT_COLLECTIONS_CONTAINER}')
	);
</script>`],
		main: `<h1 class="ui header">Collections</h1>
<table class="collapsing compact ui sortable selectable celled striped table">
	<thead>
		<tr>
			<th class="sorted ascending">Name</th>
			<th class="no-sort">Action</th>
		</tr>
	</thead>
	<tbody>
		${collections.hits.map(({
		_name: name,
		displayName,
		collector: {
			name: collectorName = ''
		} = {}
	}) => {
		const disabledCssClass = !collectorName || collectorsAppObj[collectorName] ? '' : 'disabled ';
		const tabIndexAttr = !collectorName || collectorsAppObj[collectorName] ? '' : 'tabIndex="-1"'
		return `<tr>
			<td>${displayName}</td>
			<td class="collapsing">
				<a ${tabIndexAttr} class="${disabledCssClass}tiny compact ui button" href="${TOOL_PATH}/collections/edit/${name}"><i class="blue edit icon"></i>Edit</a>
			</td>
		</tr>`;}).join('\n')}
	</tbody>
</table><div id="${ID_REACT_COLLECTIONS_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: 'Collections'
	});
};
