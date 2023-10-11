import type { Request } from '../../types/Request';


import { Role } from '@enonic/explorer-utils';
// import { toStr } from '@enonic/js-utils/value/toStr';
import lcKeys from '@enonic/js-utils/object/lcKeys';
import { hasRole } from '/lib/xp/auth';
import {
	FILEPATH_MANIFEST,
	FILEPATH_MANIFEST_NODE_MODULES,
} from '../../constants';
import {
	AUTH_PREFIX,
	DOCUMENT_REST_API_VERSION
} from '../constants';
import getImmuteableUrl from '../getImmuteableUrl';
import authorize from './authorize';


const ID_REACT_CONTAINER = 'react-container';


export default function documentation(request: Request<{
	count: string
	query: string
	sort: string
	start: string
}>): {
		body?: string | {
			error: string
		}
		contentType?: string
		status?: number
} {
	// log.info('documentation request:%s', toStr(request));

	if (!hasRole(Role.EXPLORER_READ)) {
		const maybeErrorResponse = authorize(
			request,
			undefined // Not checking access to collection
		);

		if (maybeErrorResponse.status !== 200 ) {
			return maybeErrorResponse;
		}
	}

	const {
		headers,
		// host, // can be used to match vhost.host
		// path, // can be used to match vhost.source
		// rawPath, // can be used to match vhost.target
		url
	} = request;
	const lcHeaders = lcKeys(headers) as typeof headers;
	const {
		authorization = 'Explorer-Api-Key XXXX'
	} = lcHeaders;
	const apiKey = authorization.substring(AUTH_PREFIX.length);
	const propsObj = {
		url
	};
	const documentsApiDocUrl = getImmuteableUrl({
		manifestPath: FILEPATH_MANIFEST,
		path: 'react/DocumentsApiDoc.mjs',
		request
	});
	return {
		body: `<html>
	<head>
		<meta name="robots" content="noindex,nofollow">
		<script type="text/javascript" src="${getImmuteableUrl({
			manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
			path: 'react/umd/react.development.js',
			request
		})}"></script>
		<script type="text/javascript" src="${getImmuteableUrl({
			manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
			path: 'react-dom/umd/react-dom.development.js',
			request
		})}"></script>
		<link rel="stylesheet" type="text/css" href="${getImmuteableUrl({
			manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
			path: 'semantic-ui-css/semantic.min.css',
			request
		})}">
		<script>
			window.__EXPLORER_API_KEY__ = '${apiKey}';
		</script>
		<title>Documents Endpoint - Version ${DOCUMENT_REST_API_VERSION} - API documentation</title>
		<style>
			table {
				border: 1px solid black;
				border-collapse: collapse;
			}
			tr, th, td {
				border: 1px solid black;
			}
			th, td {
				padding: 1em;
			}
			details {
				border: 1px solid black;
				border-radius: 4px;
				margin: 6px;
				padding: 6px;
			}
			.method-get summary > span:first-child,
			.method-post summary > span:first-child,
			.method-put summary > span:first-child,
			.method-delete summary > span:first-child {
				border-radius: 3px;
				color: white;
				display: inline-block;
				font-size: 14px;
				font-weight: 700;
				min-width: 80px;
				padding: 6px 15px;
				text-align: center;
			}
			.method-get {
				background-color: hsla(120,100%,50%,.1);
				border-color: green;
			}
			.method-get summary > span:first-child {
				background-color: green;
			}
			.method-post {
				background-color: hsla(240,100%,50%,.1);
				border-color: blue;

			}
			.method-post summary > span:first-child {
				background-color: blue;
			}
			.method-put {
				background-color: hsla(39,100%,50%,.1);
				border-color: darkorange;
			}
			.method-put summary > span:first-child {
				background-color: darkorange;
			}
			.method-delete {
				background-color: hsla(0,100%,50%,.1);
				border-color: red;
			}
			.method-delete summary > span:first-child {
				background-color: red;
			}
			samp {
				background-color: black;
				color: white;
				display: block;
				margin: 6px;
				padding: 6px;
				white-space: pre;
			}
		</style>
	</head>
	<body style="margin:0">
		<div id="${ID_REACT_CONTAINER}"/>
		<script type='module' defer>
			import DocumentsApiDoc from '${documentsApiDocUrl}';
			const propsObj = eval(${JSON.stringify(propsObj)});
			//console.debug('propsObj', propsObj);
			const root = ReactDOM.createRoot(document.getElementById('${ID_REACT_CONTAINER}'));
			root.render(React.createElement(DocumentsApiDoc, propsObj));
		</script>
	</body>
</html>`,
		contentType: 'text/html; charset=utf-8',
	};
} // documentation
