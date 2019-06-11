//import {toStr} from '/lib/util';

import {PRINCIPAL_EXPLORER_READ, TOOL_PATH} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {connect} from '/lib/explorer/repo/connect';
import {query as queryStopWords} from '/lib/explorer/stopWords/query';


export const list = ({
	params: {
		messages,
		status
	},
	path
}) => {
	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});
	const stopWords = queryStopWords({connection});
	//log.info(toStr({stopWords}));
	return htmlResponse({
		main: `<a class="compact ui button" href="${TOOL_PATH}/stopwords/new"><i class="green plus icon"></i> New stop words list</a>
<table class="collapsing compact ui sortable selectable celled striped table">
	<thead>
		<tr>
			<th class="sorted ascending">Display name</th>
			<th>Count</th>
			<th>Words</th>
			<th class="no-sort">Actions</th>
		</tr>
	</thead>
	<tbody>
		${stopWords.hits.map(({displayName, name, words}) => `<tr>
			<td>${displayName}</td>
			<td>${words.length}</td>
			<td>${words.join(', ')}</td>
			<td>
				<a class="tiny compact ui button" href="${TOOL_PATH}/stopwords/edit/${name}"><i class="blue edit icon"></i>Edit</a>
				<a class="tiny compact ui button" href="${TOOL_PATH}/stopwords/delete/${name}"><i class="red trash alternate outline icon"></i>Delete</a>
			</td>
		</tr>`).join('\n')}
	</tbody>
</table>`,
		messages,
		path,
		status,
		title: 'Stop words'
	});
}
