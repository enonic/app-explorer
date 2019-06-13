//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';

import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {htmlResponse} from '/admin/tools/explorer/htmlResponse';
import {connect} from '/lib/explorer/repo/connect';


const ID_REACT_SYNONYM_CONTAINER = 'reactSynonymContainer';


export function newOrEdit({
	path
}) {
	const relPath = path.replace(TOOL_PATH, '');
	const pathParts = relPath.match(/[^/]+/g);
	//const action = pathParts[1]; // synonyms
	const thesaurusName = pathParts[2];
	const secondaryAction = pathParts[3]; // new || edit
	const synonymName = pathParts[4];
	/*log.info(toStr({
		path, relPath, pathParts, thesaurusName, secondaryAction, synonymName
	}));*/

	const action = synonymName
		? `${TOOL_PATH}/thesauri/synonyms/${thesaurusName}/update/${synonymName}`
		: `${TOOL_PATH}/thesauri/synonyms/${thesaurusName}/create`;

	if(secondaryAction === 'new') {
		return htmlResponse({
			bodyEnd: [
				`<script type="text/javascript">
		ReactDOM.render(
			React.createElement(window.explorer.Synonym, ${JSON.stringify({action, secondaryAction})}),
			document.getElementById('${ID_REACT_SYNONYM_CONTAINER}')
		);
		</script>`],
			main: `<div id="${ID_REACT_SYNONYM_CONTAINER}"/>`,
			path,
			title: 'New synonym'
		});
	}

	const connection = connect({
		principals: [PRINCIPAL_EXPLORER_READ]
	});
	const node = connection.get(`/thesauri/${thesaurusName}/${synonymName}`);
	//log.info(toStr({node}));

	const {displayName, from, to} = node;
	//log.info(toStr({displayName, from, to}));

	return htmlResponse({
		bodyEnd: [
			`<script type="text/javascript">
	ReactDOM.render(
		React.createElement(window.explorer.Synonym, ${JSON.stringify({action, from: forceArray(from), secondaryAction, to: forceArray(to)})}),
		document.getElementById('${ID_REACT_SYNONYM_CONTAINER}')
	);
	</script>`],
		main: `<div id="${ID_REACT_SYNONYM_CONTAINER}"/>`,
		path,
		title: 'Edit synonym'
	});
} // newOrEdit
