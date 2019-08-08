import serialize from 'serialize-javascript';

//import {toStr} from '/lib/util';
import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
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
	const collectorsAppToUri = {};
	queryCollectors({
		connection: connect({principals: PRINCIPAL_EXPLORER_READ})
	}).hits.forEach(({
		_name: application, configAssetPath
	}) => {
		collectorsAppToUri[application] = assetUrl({
			application,
			path: configAssetPath
		});
	});

	const propsObj = {
		servicesBaseUrl: serviceUrl({service: ''}),
		TOOL_PATH
	};

	return htmlResponse({
		bodyEnd: [`<script type='module' defer>
	import {Collections} from '${assetUrl({path: 'react/Collections.esm.js'})}';
	const collectorsObj = {};
	${Object.entries(collectorsAppToUri).map(([a, u], i) => `import {Collector as Collector${i}} from '${u}';
	collectorsObj['${a}'] = Collector${i};`
	).join('\n')}
	const propsObj = eval(${serialize(propsObj)});
	propsObj.collectorsObj = collectorsObj;
	ReactDOM.render(
		React.createElement(Collections, propsObj),
		document.getElementById('${ID_REACT_COLLECTIONS_CONTAINER}')
	);
</script>`],
		main: `<div id="${ID_REACT_COLLECTIONS_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: 'Collections'
	});
};
