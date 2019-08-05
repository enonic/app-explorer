import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {PRINCIPAL_EXPLORER_READ, TOOL_PATH} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {query as queryCollections} from '/lib/explorer/collection/query';
import {connect} from '/lib/explorer/repo/connect';
import {query as getThesauri} from '/lib/explorer/thesaurus/query';

const ID_REACT_SEARCH_CONTAINER = 'reactSearchContainer';


export function search({
	path,
	params: {
		searchString = ''
	}
}) {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));
	const interfaceName = pathParts[2];

	const propsObj = {
		interfaceName,
		searchString,
		servicesBaseUrl: serviceUrl({
			service: 'whatever'
		}).replace('/whatever', '')
	};
	const propsJson = JSON.stringify(propsObj);

	const title = `Search interface ${interfaceName}`;
	return htmlResponse({
		bodyEnd: [
			`<script type='module' defer>
	import {Search} from '${assetUrl({path: 'react/Search.esm.js'})}'
	ReactDOM.render(
		React.createElement(Search, JSON.parse('${propsJson}')),
		document.getElementById('${ID_REACT_SEARCH_CONTAINER}')
	);
</script>`],
		main: `<h1 class="ui header">${title}</h1>
<div id="${ID_REACT_SEARCH_CONTAINER}"/>`,
		path,
		title
	});
}
