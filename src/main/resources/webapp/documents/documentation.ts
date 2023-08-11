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
const PATH_PREFIX = `/api/v${DOCUMENT_REST_API_VERSION}/documents`;


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
	// log.debug('documentation request:%s', toStr(request));
	if (!hasRole(Role.EXPLORER_READ)) {
		const maybeErrorResponse = authorize(
			request,
			undefined // Not checking access to collection
		);

		if (maybeErrorResponse.status !== 200 ) {
			return maybeErrorResponse;
		}
	}

	if (true) {
		const {
			headers,
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
			path: 'react/DocumentsApiDoc.mjs'
		});
		return {
			body: `<html>
		<head>
			<meta name="robots" content="noindex,nofollow">
			<script type="text/javascript" src="${getImmuteableUrl({
				manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
				path: 'react/umd/react.development.js'
			})}"></script>
			<script type="text/javascript" src="${getImmuteableUrl({
				manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
				path: 'react-dom/umd/react-dom.development.js'
			})}"></script>
			<link rel="stylesheet" type="text/css" href="${getImmuteableUrl({
				manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
				path: 'semantic-ui-css/semantic.min.css'
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
				.pre {
					white-space: pre;
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
	}

	const {
		count: countString = '10',
		query = '',
		sort = 'score DESC',
		start: startString = '0'
	} = request.params;
	// const countNumber = parseInt(countString, 10);
	// const startNumber = parseInt(startString, 10);
	return {
		body: `<html>
	<head>
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
			.pre {
				white-space: pre;
			}
			details {
				border: 1px solid black;
				border-radius: 4px;
				margin: 6px;
				padding: 6px;
			}
			.method-get span,
			.method-post span,
			.method-put span,
			.method-delete span {
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
			.method-get span {
				background-color: green;
			}
			.method-post {
				background-color: hsla(240,100%,50%,.1);
				border-color: blue;

			}
			.method-post span {
				background-color: blue;
			}
			.method-put {
				background-color: hsla(39,100%,50%,.1);
				border-color: darkorange;
			}
			.method-put span {
				background-color: darkorange;
			}
			.method-delete {
				background-color: hsla(0,100%,50%,.1);
				border-color: red;
			}
			.method-delete span {
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
		<script>
			function IsJsonString(str) {
				try {
					JSON.parse(str);
				} catch (e) {
					return false;
				}
				return true;
			}

			function myGet(event) {
				//console.log('event', event);
				event.preventDefault();

				const params = {};

				var collection = document.getElementById('getCollection').value
				if (collection) {
					params.collection = collection;
				}

				var getCount = document.getElementById('getCount').value;
				if (getCount) {
					params.count = getCount;
				}

				var getFilters = document.getElementById('getFilters').value;

				if(getFilters) {
					var filtersJson = "{}";
					if (IsJsonString(getFilters)) {
						filtersJson = getFilters;
					} else {
						eval('var js = ' + getFilters);
						//console.log('js', js);
						filtersJson = JSON.stringify(js);
						//console.log('filtersJson', filtersJson);
					}
					params.filters = filtersJson;
				}

				var getStart = document.getElementById('getStart').value;
				if (getStart) {
					params.start = getStart;
				}

				var getQuery = document.getElementById('getQuery').value;
				if (getQuery) {
					params.query = getQuery;
				}

				var getSort = document.getElementById('getSort').value;
				if (getSort) {
					params.sort = getSort;
				}

				var nodeList = document.querySelectorAll('[name=getId]'); // Dynamic
				//console.debug('nodeList', nodeList);
				//var array = Array.prototype.slice.call(nodeList); // Static
				var array = Array.from(nodeList); // Static
				//console.debug('array', array);
				let ids;
				if (array.length) {
					ids = array
						.filter((el) => el.value)
						.map((el) => \`id=\${el.value}\`).join('&');
					//console.debug('ids', ids);
				}

				//console.log('params', params);

				let urlQuery = Object.keys(params).map((k) => \`\${k}=\${params[k]}\`).join('&');
				if (ids) {
					urlQuery = \`\${urlQuery}&\${ids}\`;
				}
				//console.debug('urlQuery', urlQuery);

				fetch(\`?\${urlQuery}\`, {
					//body: filtersJson, // TypeError: Failed to execute 'fetch' on 'Window': Request with GET/HEAD method cannot have body.
					headers: { // HTTP/2 uses lowercase header keys
						'accept': 'application/json',
						'content-type': 'application/json'
					},
					method: 'GET'
				});/*.then(data => {
					console.log(data);
				});*/

				return false;
			}

			function myPost(event) {
				//console.log('event', event);
				event.preventDefault();

				const params = {};

				var collection = document.getElementById('postCollection').value
				// if (collection) {
				// 	params.collection = collection;
				// }

				var requireValidFalse = document.getElementById('requireValidFalse').checked;
				//console.log('requireValidFalse', requireValidFalse);
				if (requireValidFalse) {
					params.requireValid = 'false';
				}

				var partialTrue = document.getElementById('partialTrue').checked;
				//console.log('partialTrue', partialTrue);
				if (partialTrue) {
					params.partial = 'true';
				}

				let urlQuery = Object.keys(params).map((k) => \`\${k}=\${params[k]}\`).join('&');

				var jsStr = document.getElementById('js').value;
				//console.log('jsStr', jsStr);

				var json = "{}";
				if (IsJsonString(jsStr)) {
					json = jsStr;
				} else {
					eval('var js = ' + jsStr);
					//console.log('js', js);
					json = JSON.stringify(js);
					//console.log('json', json);
				}

				fetch(\`documents/\${collection}?\${urlQuery}\`, {
					headers: { // HTTP/2 uses lowercase header keys
						'accept': 'application/json',
						'content-type': 'application/json'
					},
					body: json,
					method: 'POST'
				});/*.then(data => {
					console.log(data);
				});*/

				return false;
			}

			function myDelete(event) {
				//console.log('event', event);
				event.preventDefault();

				let urlQuery = '';

				var collection = document.getElementById('deleteCollection').value
				if (collection) {
					urlQuery = \`collection=\${collection}&\`;
				}

				var nodeList = document.querySelectorAll('[name=deleteId]'); // Dynamic
				//console.debug('nodeList', nodeList);
				//var array = Array.prototype.slice.call(nodeList); // Static
				var array = Array.from(nodeList); // Static
				//console.debug('array', array);
				if (array.length) {
					urlQuery += array
						.filter((el) => el.value)
						.map((el) => \`id=\${el.value}\`).join('&');
				}


				fetch(\`?\${urlQuery}\`, {
					headers: { // HTTP/2 uses lowercase header keys
						'accept': 'application/json',
						'content-type': 'application/json'
					},
					method: 'DELETE'
				});/*.then(data => {
					console.log(data);
				});*/

				return false;
			}
		</script>
	</head>
	<body>
		<h1>Documents API documentation</h1>

		<h2>Bulk</h2>
		<details class="method-get">
			<summary><span>GET</span> <b>${PATH_PREFIX}/{collection}</b> Get document(s)</summary>
			<h2>Headers</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Value</th>
						<th>Attributes</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>accept</th>
						<td>application/json</td>
						<td>&lt;optional&gt;</td>
					</tr>
					<tr>
						<th>authorization</th>
						<td>Explorer-Api-Key XXXX</td>
						<td>&lt;required&gt;</td>
						<td>The API key (password) for the collection you want to get documents from.</td>
					</tr>
					<tr>
						<th>content-type</th>
						<td>application/json</td>
						<td>&lt;optional&gt;</td>
						<td>Get requests can't have a body (content) in the Fetch API standard</td>
					</tr>
				</tbody>
			</table>

			<h2>Parameters</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Attributes</th>
						<th>Default</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>collection</th>
						<td>&lt;required&gt;</td>
						<td></td>
						<td>The collection to get documents from.</td>
					</tr>

					<tr>
						<th>id</th>
						<td>&lt;optional&gt;</td>
						<td></td>
						<td>Id of document to get. May supply multiple. Will be converted into a query filter on the serverside.</td>
					</tr>

					<tr>
						<th>count</th>
						<td>&lt;optional&gt;</td>
						<td>10</td>
						<td>How many documents to get. Limited to between 1 and 100.</td>
					</tr>

					<tr>
						<th>start</th>
						<td>&lt;optional&gt;</td>
						<td>0</td>
						<td>Start index (used for paging).</td>
					</tr>

					<tr>
						<th>filters</th>
						<td>&lt;optional&gt;</td>
						<td></td>
						<td>Query filters. See <a href="https://developer.enonic.com/docs/xp/stable/storage/filters">documentation</a>.</td>
					</tr>

					<tr>
						<th>query</th>
						<td>&lt;optional&gt;</td>
						<td></td>
						<td>Query expression. Keep in mind that filters are usually more quicker. See <a href="https://developer.enonic.com/docs/xp/stable/storage/noql">documentation</a>.</td>
					</tr>

					<tr>
						<th>sort</th>
						<td>&lt;optional&gt;</td>
						<td>score DESC</td>
						<td>Sorting expression.</td>
					</tr>

				</tbody>
			</table>
			<p>If no id, filter or query provided it will simply return a (paginated) list of documents.</p>

			<h2>Example response</h2>
			<samp>[{
	_id: 'existing_id'
	field: 'value'
}]</samp>

			<h2>GET Form (XHR)</h2>
			<form autocomplete="off" method="GET" novalidate onsubmit="return myGet(event)">
				<dl>
					<dt>Collection</dt>
					<dd><input id="getCollection" name="collection" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>

					<dt><label for="getId">Id</label></dt>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>

					<dt><label for="getStart">Start</label></dt>
					<dd><input id="getStart" name="getStart" type="number" value="${startString}"/></dd>

					<dt><label for="getCount">Count</label></dt>
					<dd><input id="getCount" name="getCount" type="number" value="${countString}"/></dd>

					<dt><label for="getFilters">Filters</label></dt>
					<dd><textarea cols="173" id="getFilters" name="getFilters" rows="16">{
	boolean: {
		must: {
			exists: {
				field: 'url'
			}
		}
	},
	ids: {
		values: [
			'fb0abbd1-cd15-4b01-8528-345d0668fa6b',
			'26ab2ea6-de00-4605-88fc-894c3b4c932d'
		]
	}
}</textarea></dd>

					<dt><label for="getQuery">Query</label></dt>
					<dd><input id="getQuery" name="getQuery" placeholder="if provided keys ignored" size="80" spellcheck="false" type="text" value="${query}"/></dd>

					<dt><label for="getSort">Sort</label></dt>
					<dd><input id="getSort" name="getSort" placeholder="optionial" size="80" spellcheck="false" type="text" value="${sort}"/></dd>
				</dl>
				<input type="submit" value="GET">
			</form>
		</details>

		<details class="method-post">
			<summary><span>POST</span> <b>${PATH_PREFIX}/{collection}</b> Create or modify document(s)</summary>
			<h2>Headers</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Value</th>
						<th>Attributes</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>accept</th>
						<td>application/json</td>
						<td>&lt;optional&gt;</td>
					</tr>
					<tr>
						<th>authorization</th>
						<td>Explorer-Api-Key XXXX</td>
						<td>&lt;required&gt;</td>
						<td>The API key (password) for the collection you want to get documents from.</td>
					</tr>
					<tr>
						<th>content-type</th>
						<td>application/json</td>
						<td>&lt;required&gt;</td>
					</tr>
				</tbody>
			</table>

			<h2>Parameters</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Attributes</th>
						<th>Default</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>collection</th>
						<td>&lt;required&gt;</td>
						<td></td>
						<td>The collection to create or modify documents in.</td>
					</tr>
					<tr>
						<th>documentType</th>
						<td>&lt;semi-optional&gt;</td>
						<td></td>
						<td>
							The documentType is selected in the following order:
							<ol>
								<li>_documentTypeId property on each document in the body json.</li>
								<li>_documentType property on each document in the body json.</li>
								<li>documentTypeId url query parameter.</li>
								<li>documentType url query.</li>
								<li>documentTypeId property stored on the collection node.</li>
							</ol>
							If it's not provided by any of these ways, the document will NOT be created or updated.
						</td>
					</tr>
					<tr>
						<th>requireValid</th>
						<td>&lt;optional&gt;</td>
						<td>true</td>
						<td>The data has to be valid, according to the field types, to be created or updated. If requireValid=true and the data is not strictly valid, an error will be returned.</td>
					</tr>
					<tr>
						<th>partial</th>
						<td>&lt;optional&gt;</td>
						<td>false</td>
						<td>When true, values are only added or updated. Unprovided values are not removed.</td>
					</tr>
				</tbody>
			</table>

			<h2>body</h2>
			<p>Javascript object or array of objects, or json of the same</p>
			<table>
				<thead>
					<tr>
						<th>Type</th>
						<th>Data</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>JSON of javascript object</th>
						<td class="pre">{
	"text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
	"title":"Hello World",
	"uri":"https://www.example.com"
}</td>
					</tr>
					<tr>
						<th>JSON of javascript array of objects</th>
						<td class="pre">[
	{
		"text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
		"title":"The standard Lorem Ipsum passage, used since the 1500s",
		"uri":"https://www.example.com"
	},
	{
		"text":"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
		"title":"Section 1.10.32 of \\"de Finibus Bonorum et Malorum\\", written by Cicero in 45 BC",
		"uri":"https://www.iana.org/"
	}
]</td>
					</tr>
				</tbody>
			</table>

			<h2>Example responses</h2>
			<samp>[{
	_id: 'created_id'
},{
	_id: 'modified_id',
},{
	error: 'Something went wrong when trying to create the document!'
},{
	error: 'Something went wrong when trying to modify the document!'
}]</samp>

			<h2>POST Form Create or modify (XHR)</h2>
			<form autocomplete="off" method="POST" novalidate onsubmit="return myPost(event)">
				<dl>
					<dt>Collection</dt>
					<dd><input id="postCollection" name="collection" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>

					<dt>Require valid</dt>
					<dd>
						<input checked="checked" id="requireValidTrue" name="requireValid" type="radio" value="true"/>
						<label for="requireValidTrue">True</label>
						<input id="requireValidFalse" name="requireValid" type="radio" value="false"/>
						<label for="requireValidFalse">False</label>
					</dd>

					<dt>Partial</dt>
					<dd>
						<input id="partialTrue" name="partial" type="radio" value="true"/>
						<label for="partialTrue">True</label>
						<input checked="checked" id="partialFalse" name="partial" type="radio" value="false"/>
						<label for="partialFalse">False</label>
					</dd>

					<dt><label for="js">Javascript object or array of objects, or json of the same</label></dt>
					<dd><textarea cols="173" id="js" name="js" rows="14">[{
	available: true,
	count: -999999999999999,
	date: '2021-01-01',
	datetime: '2021-01-01T00:00:00',
	instant: '2021-01-01T00:00:00Z',
	location: '59.9090442,10.7423389',
	//price: -9.9999999999999999,
	price: -999999999999999.9,
	time: '00:00:00',
	language: 'english',
	text: 'This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.',
	title: 'Example Domain',
	url: 'https://www.example.com'
},{
	available: false,
	count: 999999999999999,
	date: '2021-12-31',
	datetime: '2021-12-31T23:59:59',
	instant: '2021-12-31T23:59:59Z',
	location: [
		59.9090442,
		10.7423389
	],
	//price: 9.9999999999999999,
	price: 999999999999999.9,
	time: '23:59:59',
	language: 'english',
	text: 'Whatever',
	title: 'Whatever',
	url: 'https://www.whatever.com'
}]</textarea></dd>
				<input type="submit" value="POST">
			</form>
		</details>

		<details class="method-post">
			<summary><span>POST</span> <b>${PATH_PREFIX}/{collection}/query</b> Query documents</summary>
		</details>

		<details class="method-delete">
			<summary><span>DELETE</span> <b>${PATH_PREFIX}/{collection}</b> Delete document(s)</summary>
			<h2>Headers</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Value</th>
						<th>Attributes</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>accept</th>
						<td>application/json</td>
						<td>&lt;optional&gt;</td>
					</tr>
					<tr>
						<th>authorization</th>
						<td>Explorer-Api-Key XXXX</td>
						<td>&lt;required&gt;</td>
						<td>The API key (password) for the collection you want to get documents from.</td>
					</tr>
					<tr>
						<th>content-type</th>
						<td>application/json</td>
						<td>&lt;optional&gt;</td>
					</tr>
				</tbody>
			</table>

			<h2>Parameters</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Attributes</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>collection</th>
						<td>&lt;required&gt;</td>
						<td>The collection to delete documents from.</td>
					</tr>
					<tr>
						<th>id</th>
						<td>&lt;required&gt;</td>
						<td>Id of document to delete. May supply multiple.</td>
					</tr>
				</tbody>
			</table>

			<h2>Example response</h2>
			<samp>[{
	_id: 'existing_id'
},{
	_id: 'non_existant_id',
	error: 'Unable to find document with key = non_existant_id!'
}]</samp>
			<h2>DELETE Form (XHR)</h2>
			<form autocomplete="off" method="DELETE" novalidate onsubmit="return myDelete(event)">
				<dl>
					<dt>Collection</dt>
					<dd><input id="deleteCollection" name="collection" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>

					<dt><label for="deleteId">Id</label></dt>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" spellcheck="false" type="text" value=""/></dd>
				</dl>
				<input type="submit" value="DELETE">
			</form>
		</details>

		<h2>Single</h2>

		<details class="method-get">
			<summary><span>GET</span> <b>${PATH_PREFIX}/{collection}/{documentId}</b> Get a document</summary>
		</details>

		<details class="method-post">
			<summary><span>POST</span> <b>${PATH_PREFIX}/{collection}/{documentId}</b> Patch a document</summary>
		</details>

		<!--details class="method-put">
			<summary><span>PUT</span> <b>${PATH_PREFIX}/{collection}/{documentId}</b> Replace a document</summary>
		</details-->

		<details class="method-delete">
			<summary><span>DELETE</span> <b>${PATH_PREFIX}/{collection}/{documentId}</b> Delete a document</summary>
		</details>

	</body>
</html>`,
		contentType: 'text/html;charset=utf-8'
	};
} // documentation
