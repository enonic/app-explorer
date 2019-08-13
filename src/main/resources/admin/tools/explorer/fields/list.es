import serialize from 'serialize-javascript';

import {toStr} from '/lib/util';
import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {
	DEFAULT_FIELDS,
	NO_VALUES_FIELDS,
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


const ID_REACT_FIELDS_CONTAINER = 'reactFieldsContainer';


export function list({
	params: {
		messages,
		status
	},
	path
}) {
	const propsObj = {
		defaultFields: DEFAULT_FIELDS.map(({_name})=>_name),
		noValuesFields: NO_VALUES_FIELDS.map(({_name})=>_name),
		servicesBaseUrl: serviceUrl({service: ''})
	};

	return htmlResponse({
		bodyEnd: [`<script type='module' defer>
	import {Fields} from '${assetUrl({path: 'react/Fields.esm.js'})}';
	const propsObj = eval(${serialize(propsObj)});
	ReactDOM.render(
		React.createElement(Fields, propsObj),
		document.getElementById('${ID_REACT_FIELDS_CONTAINER}')
	);
</script>`],
		main: `<div id="${ID_REACT_FIELDS_CONTAINER}"/>`,
		messages,
		path,
		status,
		title: 'Fields'
	});
}
