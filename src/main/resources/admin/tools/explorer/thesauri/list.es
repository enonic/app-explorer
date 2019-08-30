import serialize from 'serialize-javascript';

//import {toStr} from '/lib/util';
import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {TOOL_PATH} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


const ID_REACT_THESAURI_CONTAINER = 'reactThesauriContainer';


export function list({
	params: {
		messages,
		status
	},
	path
}) {
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
		main: `<div id="${ID_REACT_THESAURI_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: 'Thesauri'
	});
}
