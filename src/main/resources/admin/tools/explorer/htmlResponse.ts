import type {TaskInfo} from '/lib/xp/task';

import {
	// Principal,
	Repo
} from '@enonic/explorer-utils';
// import {toStr} from '@enonic/js-utils';
import {getToolUrl} from '/lib/xp/admin';
import {getLauncherPath} from '/lib/xp/admin';
import {runAsSu} from '/lib/explorer/runAsSu';
import {get as getRepo} from '/lib/xp/repo';
import {list as listTasks} from '/lib/xp/task';
import {jsonParseResource} from '../../../lib/app/explorer/jsonParseResource';

const ID_REACT_EXPLORER_CONTAINER = 'reactExplorerContainer';

const SERVICE_NAME = 'explorerAssets';

const FILEPATH_MANIFEST = `/services/${SERVICE_NAME}/files/manifest.json`;
const FILEPATH_MANIFEST_NODE_MODULES = `/services/${SERVICE_NAME}/files/node_modules_manifest.json`;

const MANIFESTS = {
	[FILEPATH_MANIFEST]: jsonParseResource(FILEPATH_MANIFEST),
	[FILEPATH_MANIFEST_NODE_MODULES]: jsonParseResource(FILEPATH_MANIFEST_NODE_MODULES),
}

// @ts-ignore
// const {currentTimeMillis} = Java.type('java.lang.System') as {
// 	currentTimeMillis: () => number
// }

function getImmuteableUrl({
	manifestPath = FILEPATH_MANIFEST_NODE_MODULES,
	path,
}: {
	manifestPath?: string
	path: string,
}) {
	const manifest = MANIFESTS[manifestPath];
	if (!manifest) {
		const msg = `getImmuteableUrl manifestPath:${manifestPath} not found! manifests:${JSON.stringify(Object.keys(MANIFESTS), null, 4)}`;
		log.error(msg);
		throw new Error(msg);
	}
	const pathWithHash = manifest[path];
	if (!pathWithHash) {
		const msg = `getImmuteableUrl path:${path} not found in manifestPath:${manifestPath}! manifest:${JSON.stringify(manifest, null, 4)}`;
		log.error(msg);
		throw new Error(msg);
	}
	return `/_/service/${app.name}/${SERVICE_NAME}/${pathWithHash}`;
}


export function htmlResponse({
	status = 200
} = {}) {
	// log.info('htmlResponse status:%s', status);

	// On first startup repos are not yet created.
	// There is a init task, but it takes a little while to start it.

	let initTask: TaskInfo;
	runAsSu(() => { // Fix #784 Access denied to user with only Explorer Administrator role.
		if (!getRepo(Repo.EXPLORER)) {
			initTask = {
				progress: {
					current: 0,
					info: 'Starting task...',
					total: 15
				},
				// @ts-expect-error Custom value, not matching TaskStateType
				state: 'STARTING'
			};
		}
	});

	const filteredTaskList = listTasks({
		name: 'com.enonic.app.explorer:init'
	});
	if (filteredTaskList.length) {
		initTask = filteredTaskList[0];
	}
	if (initTask) {
		//const currentTime = currentTimeMillis();
		const {
			progress: {
				current,
				info,
				total
			},
			//startTime,
			state
		} = initTask;
		//const remainingCount = total - current;
		if(['STARTING', 'RUNNING', 'WAITING'].includes(state)) {
			return {
				body: `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=Edge">
		<meta name="viewport" content="width=device-width, user-scalable=no">
		<meta name="theme-color" content="#ffffff">
		<meta http-equiv="refresh" content="1"/>
		<title>Explorer</title>
		<style>
			td, th {
				border: 1px solid gray;
				padding: 2px;
			}
			th {
				font-weight: bold;
			}
		</style>
	</head>
	<body>
		<main>
			<h1>Initialization task progress</h1>
			<table style="width:100%">
				<thead>
					<tr>
						<th>Info</th>
						<th>Progress</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td style="width: 1%;white-space: nowrap;">${info}</td>
						<td><div style="background-color:lightgray;text-align: center;width:${current/total*100}%">[${current}/${total}]</div></td>
					</tr>
				</tbody>
			</table>
			<p>Refreshing page in 1 second.</p>
		</main>
	</body>
</html>`,
				contentType: 'text/html; charset=utf-8'
			};
		}
	}

	// <script type="text/javascript" src="${getImmuteableUrl({path: 'frappe-gantt/frappe-gantt.min.js'})}"></script>
	// <link rel="stylesheet" type="text/css" href="${getImmuteableUrl({path: 'frappe-gantt/frappe-gantt.css'})}">

	const REACT_MODE_POSTFIX = 'development.js'; // 'production.min.js';

	return {
		body: `<html>
	<head>
		<meta name="robots" content="noindex,nofollow">
		<link rel="shortcut icon" href="${getImmuteableUrl({manifestPath: FILEPATH_MANIFEST, path: 'favicon.ico'})}">
		<script type="text/javascript" src="${getImmuteableUrl({path: `react/umd/react.${REACT_MODE_POSTFIX}`})}"></script>
		<script type="text/javascript" src="${getImmuteableUrl({path: `react-dom/umd/react-dom.${REACT_MODE_POSTFIX}`})}"></script>
		<link rel="stylesheet" type="text/css" href="${getImmuteableUrl({path: 'graphiql/graphiql.min.css'})}">
		<link rel="stylesheet" type="text/css" href="${getImmuteableUrl({path: 'nice-react-gantt/lib/css/style.css'})}">
		<link rel="stylesheet" type="text/css" href="${getImmuteableUrl({path: 'semantic-ui-css/semantic.css'})}">
		<link rel="stylesheet" type="text/css" href="${getImmuteableUrl({path: 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css'})}">
		<link rel="stylesheet" type="text/css" href="${getImmuteableUrl({manifestPath: FILEPATH_MANIFEST, path: 'styles.css'})}">
		<title>Explorer</title>
		<style type="text/css">
			/*
				Fix clearable dropdown
				See https://github.com/fomantic/Fomantic-UI/issues/1259

				Selector has same specificity as
				.ui.dropdown > .dropdown.icon:before
				and is placed after semantic.css to win :)
			*/
			.ui.dropdown > .clear.icon:before {
				content: '\\f00d';
				font-family: Icons;
			}
		</style>
		<svg style="display: none" version="2.0">
			<defs>
				<symbol id="json" fill="currentColor" viewBox="0 0 512 512">
					<path d="M284.09589 382.75518c126.40972-96.06768 39.60866-294.89635-69.51243-277.86038-205.2681 32.04643-153.92524 317.32819-85.53674 370.36292C22.04198 422.38997-22.42647 291.21668 10.82114 179.73984 37.160205 91.426854 119.28723 3.96245 243.70826.61041c196.3664-17.911315 254.87234 364.1644 40.38763 382.14477zm-64.84876-252.55609C106.94737 135.9266 82.72514 249.3567 91.95607 331.31256c13.46832 119.5772 89.24288 197.21638 207.55413 177.68424 181.77637-30.00966 331.90336-318.72546 76.44101-480.0149 94.10969 109.62379 94.98251 331.71315-59.62399 371.12974-142.98119 43.10216-208.07573-187.72477-97.08009-269.91255z"/>
				</symbol>
				<symbol id="graphql100" fill="#e10098" style="fill:color(display-p3 .8824 0 .5961)" viewBox="0 0 100 100">
					<path fill-rule="evenodd" d="M50 6.90308 87.323 28.4515v43.0969L50 93.0968 12.677 71.5484V28.4515L50 6.90308ZM16.8647 30.8693v31.6558l27.4148-47.4837-27.4148 15.8279ZM50 13.5086 18.3975 68.2457h63.205L50 13.5086Zm27.4148 58.9248H22.5852L50 88.2613l27.4148-15.8279Zm5.7205-9.9083L55.7205 15.0414l27.4148 15.8279v31.6558Z" clip-rule="evenodd"/>
					<circle cx="50" cy="9.3209" r="8.82"/>
					<circle cx="85.2292" cy="29.6605" r="8.82"/>
					<circle cx="85.2292" cy="70.3396" r="8.82"/>
					<circle cx="50" cy="90.6791" r="8.82"/>
					<circle cx="14.7659" cy="70.3396" r="8.82"/>
					<circle cx="14.7659" cy="29.6605" r="8.82"/>
				</symbol>
			</defs>
		</svg>
	</head>
	<body style="background-color: white !important;">
		<div id="${ID_REACT_EXPLORER_CONTAINER}"/>
		${
			//<script type="text/javascript" src="${getImmuteableUrl({manifestPath: FILEPATH_MANIFEST, path: 'Explorer.mjs'})}"></script>
			''
		}
		<script type="text/javascript" src="${getLauncherPath()}" data-config-theme="dark" async></script>
		<script type='module' defer>
			import {App} from '${getImmuteableUrl({manifestPath: FILEPATH_MANIFEST, path: 'Explorer.mjs'})}';
			const root = ReactDOM.createRoot(document.getElementById('${ID_REACT_EXPLORER_CONTAINER}'));
			// root.render(React.createElement(window.Explorer.App));
			root.render(React.createElement(App));
		</script>
	</body>
</html>`,
		contentType: 'text/html; charset=utf-8',
		headers: {
			'explorer-tool-url': getToolUrl(app.name, 'explorer') // Fix #873 getToolUrl must be run on each request, because of vhost
		},
		status
	};
}
