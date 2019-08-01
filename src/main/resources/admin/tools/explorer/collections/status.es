import {assetUrl, serviceUrl} from '/lib/xp/portal';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


const ID_REACT_STATUS_CONTAINER = 'reactStatusContainer';


export const status = ({
	params: {
		messages,
		status
	},
	path
}) => {
	const propsObj = {
		serviceUrl: serviceUrl({
			service: 'listCollectors'
		})
	};
	const propsJson = JSON.stringify(propsObj);
	return htmlResponse({
		bodyEnd: [
			`<script type='module' defer>
	import {Status} from '${assetUrl({path: 'react/Status.esm.js'})}'
	ReactDOM.render(
		React.createElement(Status, JSON.parse('${propsJson}')),
		document.getElementById('${ID_REACT_STATUS_CONTAINER}')
	);
</script>`
		],
		main: `<h1 class="ui header">Collector tasks status</h1>
<div id="${ID_REACT_STATUS_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: 'Status'
	})
} // status
