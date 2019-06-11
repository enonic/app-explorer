import {serviceUrl} from '/lib/xp/portal';
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
			`<script type="text/javascript">
	ReactDOM.render(
		React.createElement(window.yase.Status, ${propsJson}),
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
