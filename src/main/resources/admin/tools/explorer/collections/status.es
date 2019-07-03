import {assetUrl, serviceUrl} from '/lib/xp/portal';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {menu} from '/admin/tools/explorer/collections/menu';


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
		bodyBegin: [
			menu({path})
		],
		bodyEnd: [
			`<script type='module' defer>
	import {Status} from '${assetUrl({path: 'react/Status.esm.js'})}'
	ReactDOM.render(
		React.createElement(Status, JSON.parse('${propsJson}')),
		document.getElementById('${ID_REACT_STATUS_CONTAINER}')
	);
</script>`
		],
		main: `<div id="${ID_REACT_STATUS_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: 'Status'
	})
} // status
