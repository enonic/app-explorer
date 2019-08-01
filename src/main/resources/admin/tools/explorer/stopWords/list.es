import serialize from 'serialize-javascript';

//import {toStr} from '/lib/util';
import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {PRINCIPAL_EXPLORER_READ, TOOL_PATH} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {connect} from '/lib/explorer/repo/connect';
//import {query as queryStopWords} from '/lib/explorer/stopWords/query';


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
	//const stopWordsRes = queryStopWords({connection});
	const propsObj = {
		servicesBaseUrl: serviceUrl({
			service: 'whatever'
		}).replace('/whatever', ''),
		//stopWordsRes,
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
		main: `<h1 class="ui header">Stop word lists</h1>
<div id="${ID_REACT_STOPWORDS_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: 'Stop words'
	});
}
