import {TOOL_PATH} from '/lib/enonic/yase/admin/constants';
//import {toStr} from '/lib/enonic/util';
import {assetUrl} from '/lib/xp/portal';


export function htmlResponse({
	main = '',
	messages = [],
	path = TOOL_PATH,
	title = '',
	status = 200
} = {}) {
	const relPath = path.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	const preTitle = title ? `${title} - ` : '';
	return {
		body: `<html>
	<head>
		<title>${preTitle}YASE Administrator</title>
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'style.css'})}">
	</head>
	<body>
		<nav>
			<ul>
				<li><a class="${relPath === '' ? 'current' : ''}" href="${TOOL_PATH}">YASE</a></li>
				<li><a class="${relPath.startsWith('/collections') ? 'current' : ''}" href="${TOOL_PATH}/collections">Collections</a></li>
				<li><a class="${relPath.startsWith('/fields') ? 'current' : ''}" href="${TOOL_PATH}/fields">Fields</a></li>
				<li><a class="${relPath.startsWith('/tags') ? 'current' : ''}" href="${TOOL_PATH}/tags">Tags</a></li>
				<li><a class="${relPath.startsWith('/thesauri') ? 'current' : ''}" href="${TOOL_PATH}/thesauri">Thesauri</a></li>
			</ul>
		</nav>
		${messages.length ? `<ul class="${status === 200 ? 'success' : 'error'}">${messages.map(m => `<li>${m}</li>`)}</ul>` : ''}
		<main>${main}</main>
	</body>
</html>`,
		contentType: 'text/html; charset=utf-8',
		status
	};
}
/*
<script type="text/javascript" src="${assetUrl({path: 'react/react.production.min.js'})}"></script>
<script type="text/javascript" src="${assetUrl({path: 'react-dom/react-dom.production.min.js'})}"></script>
<script type="text/javascript" src="${assetUrl({path: 'scripts.js'})}"></script>
*/
