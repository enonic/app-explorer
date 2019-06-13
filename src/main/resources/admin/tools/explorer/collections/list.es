//import {toStr} from '/lib/util';

import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {menu} from '/admin/tools/explorer/collections/menu';
import {getDocumentCount} from '/lib/explorer/collection/getDocumentCount';
import {query} from '/lib/explorer/collection/query';
import {usedInInterfaces} from '/lib/explorer/collection/usedInInterfaces';
import {connect} from '/lib/explorer/repo/connect';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {query as queryCollectors} from '/lib/explorer/collector/query';


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
	let totalCount = 0;
	//log.info(toStr({collections}));
	return htmlResponse({
		bodyBegin: [
			menu({path})
		],
		main: `<table class="collapsing compact ui sortable selectable celled striped table">
	<thead>
		<tr>
			<th class="sorted ascending">Name</th>
			<th>Documents</th>
			<th>Collect</th>
			<th class="no-sort">Interfaces</th>
			<!--th class="no-sort">Collector</th-->
			<th class="no-sort">Action(s)</th>
		</tr>
	</thead>
	<tbody>
		${collections.hits.map(({
		_name: name,
		displayName,
		doCollect = false,
		collector: {
			name: collectorName = ''
		} = {}
	}) => {
		const disabledCssClass = !collectorName || collectorsAppObj[collectorName] ? '' : 'disabled ';
		const tabIndexAttr = !collectorName || collectorsAppObj[collectorName] ? '' : 'tabIndex="-1"'
		const count = getDocumentCount(name);
		if (count) {
			totalCount += count;
		}
		return `<tr>
			<td>${displayName}</td>
			<td class="right aligned" data-sort-value="${count}">${count}</td>
			<td>${doCollect}</td>
			<td>${usedInInterfaces({
		connection: readConnection,
		name
	}).join(', ')||''}</td>
			<!--td>${collectorName}</td-->
			<td>
				<a ${tabIndexAttr} class="${disabledCssClass}tiny compact ui button" href="${TOOL_PATH}/collections/edit/${name}"><i class="blue edit icon"></i>Edit</a>
				<a ${tabIndexAttr} class="${disabledCssClass}tiny compact ui button" href="${TOOL_PATH}/collections/collect/${name}"><i class="green cloud download icon"></i>Collect</a>
				<a ${tabIndexAttr} class="${disabledCssClass}tiny compact ui button" href="${TOOL_PATH}/collections/collect/${name}?resume=true"><i class="green redo alternate icon"></i>Resume</a>
				<a ${tabIndexAttr} class="${disabledCssClass}tiny compact ui button" href="${TOOL_PATH}/collections/stop/${name}"><i class="red stop icon"></i>Stop</a>
				<a class="tiny compact ui button" href="${TOOL_PATH}/collections/delete/${name}"><i class="red trash alternate outline icon"></i>Delete</a>
			</td>
		</tr>`;}).join('\n')}
	</tbody>
	<tfoot>
		<tr>
			<th></th>
			<th class="right aligned">${totalCount}</th>
			<th></th>
			<!--th></th-->
			<th></th>
		</tr>
	</tfoot>
</table>`,
		messages,
		path,
		status,
		title: 'Collections'
	});
};
