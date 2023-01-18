import type {TaskInfo} from '/lib/xp/task';
import type {ExplorerProps} from '/index.d';


//import {toStr} from '@enonic/js-utils';
import serialize from 'serialize-javascript';
//@ts-ignore
import {isLicenseValid, getIssuedTo} from '/lib/licensing';
import {getToolUrl} from '/lib/xp/admin';
import {
	assetUrl,
	serviceUrl,
} from '/lib/xp/portal';
import {getLauncherPath} from '/lib/xp/admin';

import {
	PRINCIPAL_EXPLORER_READ,
	REPO_ID_EXPLORER
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as queryCollectors} from '/lib/explorer/collector/query';
import {get as getRepo} from '/lib/xp/repo';
import {list as listTasks} from '/lib/xp/task';

const ID_REACT_EXPLORER_CONTAINER = 'reactExplorerContainer';

const EXPLORER_URL = getToolUrl(app.name, 'explorer');

//const {currentTimeMillis} = Java.type('java.lang.System');

export function htmlResponse({
	status = 200
} = {}) {
	// On first startup repos are not yet created.
	// There is a init task, but it takes a little while to start it.

	let initTask :TaskInfo;
	if (!getRepo(REPO_ID_EXPLORER)) {
		initTask = {
			progress: {
				current: 0,
				info: 'Starting task...',
				total: 15
			},
			state: 'STARTING'
		};
	}
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
	//log.info(toStr({path}));

	const propsObj: Partial<ExplorerProps> = {
		basename: EXPLORER_URL,
		licensedTo: getIssuedTo(),
		licenseValid: isLicenseValid(),
		servicesBaseUrl: serviceUrl({service: ''}),
		wsBaseUrl: serviceUrl({service: '', type: 'absolute'}).replace('http', 'ws')
	};
	//const propsJson = JSON.stringify(propsObj);
	//log.info(`propsJson:${propsJson}`);

	const collectorsAppToUri = {};
	const collectorsObj = {};
	queryCollectors({
		connection: connect({principals: [PRINCIPAL_EXPLORER_READ]})
	}).hits.forEach(({
		//_name: collectorId,
		appName,
		taskName,
		componentPath,
		configAssetPath
	}) => {
		const collectorId = `${appName}:${taskName}`;
		collectorsAppToUri[collectorId] = assetUrl({
			application: appName,
			path: configAssetPath
		});
		collectorsObj[collectorId] = {
			componentPath,
			url: assetUrl({
				application: appName,
				path: configAssetPath
			})
		};
	});
	//log.info(toStr({collectorsAppToUri}));

	/*
<script type="text/javascript" src="${assetUrl({path: 'react/react.production.min.js'})}"></script>
<script type="text/javascript" src="${assetUrl({path: 'react-dom/react-dom.production.min.js'})}"></script>
<script type="text/javascript" src="${assetUrl({path: 'frappe-gantt/frappe-gantt.min.js'})}"></script>
<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'style.css'})}">
<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'frappe-gantt/frappe-gantt.css'})}">

// Not needed for the XP Menu
<link rel="stylesheet" type="text/css" href="${assetUrl({path: '/admin/common/styles/lib.css'})}">
<script type="text/javascript" src="${assetUrl({path: '/admin/common/js/lib.js'})}"></script>

// Destroys icons in semantic-ui
<script type="text/javascript">
var CONFIG = {
adminUrl: '${getBaseUri()}',
appId: '${app.name}',
launcherUrl: '${getLauncherUrl()}',
services: {}, // Workaround for i18nUrl BUG
};
</script>
<script type="text/javascript" src="${getLauncherPath()}" async></script>

<script type="text/javascript" src="${assetUrl({path: 'js/tablesort.js'})}"></script>
<script type="text/javascript">
	/*$(document).ready(function() {
		$('select.dropdown').dropdown();
		$('table').tablesort();

		const headerHeight = parseInt($('header').css('height'));
		$('#mySidebar').css('padding-top', headerHeight);
		//$('#myPusher').css('margin-top', headerHeight);
		$('#myPusher').css('padding', 14);
		$('#myPusher').css('padding-top', 14 + headerHeight);

		if ($('#mySidebar').sidebar('is mobile')) {
			$('#mySidebar').sidebar({
				closable: true,
				dimPage: true,
				mobileTransition: 'overlay',
				onHide: () => $('#myIcon').removeClass('close').addClass('sidebar'),
				onVisible: () => $('#myIcon').removeClass('sidebar').addClass('close')
			});
			$('#myPusher').css('width', 'auto');
			$('#mySidebar').sidebar('hide');
		} else {
			$('#mySidebar').sidebar({
				closable: false,
				dimPage: false,
				onHide: () => $('#myIcon').removeClass('close').addClass('sidebar'),
				onVisible: () => $('#myIcon').removeClass('sidebar').addClass('close'),
				transition: 'push'
			});
		}

		jQuery(window).resize(function() {
			if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 768) {
				$('#mySidebar').sidebar('hide');
			} else {
				$('#mySidebar').sidebar('show');
			}
		});
	});
</script>
<script src="https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll/dist/smooth-scroll.polyfills.min.js"></script>

<script type="text/javascript">
	var scroll = new SmoothScroll('a[href*="#"]');
</script>
<script type="text/javascript" src="${assetUrl({path: 'jquery/jquery.js'})}"></script>
<script type="text/javascript">
	jQuery = $; // Needed by semantic-ui
</script>
<script type="text/javascript" src="${assetUrl({path: 'semantic-ui/semantic.js'})}"></script>
<!--script type="text/javascript" src="${assetUrl({path: 'semantic-ui-react/umd/semantic-ui-react.min.js'})}"></script-->
<!--script type="text/javascript" src="${assetUrl({path: 'semantic-ui-react/commonjs/index.js'})}"></script-->
<!--script type="text/javascript" src="${assetUrl({path: 'semantic-ui-react/commonjs/umd.js'})}"></script-->
//import * from '${assetUrl({path: 'semantic-ui-react/umd/semantic-ui-react.min.js'})}';
//import {Header} from '${assetUrl({path: 'semantic-ui-react/commonjs/index.js'})}';
//import {Header, Icon, List, Menu, Modal, Popup, Sidebar} from '${assetUrl({path: 'semantic-ui-react/commonjs/umd.js'})}';
//import {Header, Icon, List, Menu, Modal, Popup, Sidebar} from '${assetUrl({path: 'semantic-ui-react/es/index.js'})}';
//const semantic = {Header, Icon, List, Menu, Modal, Popup, Sidebar};
*/

	return {
		body: `<html>
	<head>
		<meta name="robots" content="noindex,nofollow">
		<script type="text/javascript" src="${assetUrl({path: 'react/react.development.js'})}"></script>
		<script type="text/javascript" src="${assetUrl({path: 'react-dom/react-dom.development.js'})}"></script>
		<link rel="shortcut icon" href="${assetUrl({path: 'favicon.ico'})}">
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'graphiql/graphiql.min.css'})}">
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'nice-react-gantt/style.css'})}">
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'semantic-ui-css/semantic.css'})}">
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'react-semantic-ui-datepickers/react-semantic-ui-datepickers.css'})}">
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'style/bundle.css'})}">
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
				<symbol id="json" viewbox="0 0 24 24">
					<g transform="translate(0 -1028.362)">
						<path style="fill:none;fill-rule:evenodd;stroke:#000;stroke-width:2.01073027;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M2.026 1040.272s1.865-.048 2.412.51c1.984 2.03-1.575 5.852.41 7.883.6.615 2.139.595 2.139.595"/>
						<path d="M2.026 1040.356s1.865.048 2.412-.511c1.984-2.03-1.575-5.852.41-7.883.6-.614 2.139-.594 2.139-.594M21.974 1040.272s-1.865-.048-2.412.51c-1.985 2.03 1.575 5.852-.41 7.883-.6.615-2.139.595-2.139.595" style="fill:none;fill-rule:evenodd;stroke:#000;stroke-width:2.01073027;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"/>
						<path style="fill:none;fill-rule:evenodd;stroke:#000;stroke-width:2.01073027;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="M21.974 1040.356s-1.865.048-2.412-.511c-1.985-2.03 1.575-5.852-.41-7.883-.6-.614-2.139-.594-2.139-.594"/>
						<circle r="2" cy="1037.362" cx="12" style="opacity:1;fill:#000;fill-opacity:1;stroke:none;stroke-width:0;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"/>
						<circle style="opacity:1;fill:#000;fill-opacity:1;stroke:none;stroke-width:0;stroke-linecap:butt;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" cx="12" cy="1043.362" r="2"/>
						<path d="M12.98 1043.429s.242 2.059-.766 3.244c-.814.956-2.186.907-2.186.907" style="fill:none;fill-rule:evenodd;stroke:#000;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"/>
					</g>
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
		<script type="text/javascript" src="${assetUrl({path: 'explorer.js'})}"></script>
		<script type="text/javascript" src="${assetUrl({path: 'react/Explorer.esm.js'})}"></script>
		<script type="text/javascript" src="${getLauncherPath()}" data-config-theme="dark" async></script>
		${Object.keys(collectorsAppToUri).map((a) => `<script type="text/javascript" src="${collectorsAppToUri[a]}"></script>`)
		.join('\n')}
		<script type='module' defer>
			const propsObj = eval(${serialize(propsObj)});
			//console.debug('propsObj', propsObj);
			const collectorComponents = {};
			${Object.keys(collectorsObj).map((collectorId) => `collectorComponents['${collectorId}'] = ${collectorsObj[collectorId].componentPath}`)}
			propsObj.collectorComponents = collectorComponents;
			const root = ReactDOM.createRoot(document.getElementById('${ID_REACT_EXPLORER_CONTAINER}'));
			root.render(React.createElement(window.LibExplorer.App, propsObj));
		</script>
	</body>
</html>`,
		contentType: 'text/html; charset=utf-8',
		status
	};
}
//const propsObj = JSON.parse('${propsJson}');

/*
$('.ui.checkbox').checkbox();
<script type="text/javascript" src="${assetUrl({path: 'scripts.js'})}"></script>
*/
