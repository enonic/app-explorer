import serialize from 'serialize-javascript';

//import {toStr} from '/lib/util';
import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {PRINCIPAL_EXPLORER_READ, TOOL_PATH} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {connect} from '/lib/explorer/repo/connect';
import {query as queryStopWords} from '/lib/explorer/stopWords/query';


const ID_REACT_STOPWORDS_CONTAINER = 'reactStopWordsContainer';


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
	const stopWordsRes = queryStopWords({connection});
	const propsObj = {
		servicesBaseUrl: serviceUrl({
			service: 'whatever'
		}).replace('/whatever', ''),
		stopWordsRes,
		TOOL_PATH
	};
	//log.info(toStr({stopWordsRes}));
	return htmlResponse({
		bodyEnd: [`<script type='module' defer>
	import {StopWords} from '${assetUrl({path: 'react/StopWords.esm.js'})}';
	const propsObj = eval(${serialize(propsObj)});
	ReactDOM.render(
		React.createElement(StopWords, propsObj),
		document.getElementById('${ID_REACT_STOPWORDS_CONTAINER}')
	);
</script>`],
		main: `
		<!-- a class="compact ui button" href="${TOOL_PATH}/stopwords/new"><i class="green plus icon"></i> New stop words list</a-->
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
		${stopWordsRes.hits.map(({displayName, name, words}) => `<tr>
			<td>${displayName}</td>
			<td>${words.length}</td>
			<td>${words.join(', ')}</td>
			<td>
				<a class="tiny compact ui button" href="${TOOL_PATH}/stopwords/edit/${name}"><i class="blue edit icon"></i>Edit</a>
				<a class="tiny compact ui button" href="${TOOL_PATH}/stopwords/delete/${name}"><i class="red trash alternate outline icon"></i>Delete</a>
			</td>
		</tr>`).join('\n')}
	</tbody>
</table><div id="${ID_REACT_STOPWORDS_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: 'Stop words'
	});
}
