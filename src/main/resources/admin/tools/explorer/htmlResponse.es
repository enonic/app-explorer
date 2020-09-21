import serialize from 'serialize-javascript';

import {validateLicense} from '/lib/license';
//import {toStr} from '/lib/util';
/*import {forceArray} from '/lib/util/data';
import {
	getBaseUri,
	getLauncherPath,
	getLauncherUrl
} from '/lib/xp/admin';*/
import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_READ//,
	//REPO_ID_EXPLORER
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as queryCollectors} from '/lib/explorer/collector/query';
//import {get as getRepo} from '/lib/xp/repo';
import {list as listTasks} from '/lib/xp/task';

const ID_REACT_EXPLORER_CONTAINER = 'reactExplorerContainer';

//const {currentTimeMillis} = Java.type('java.lang.System');

export function htmlResponse({
	status = 200
} = {}) {
	const filteredTaskList = listTasks({
		name: 'com.enonic.app.explorer:init'
	});
	//const currentTime = currentTimeMillis();
	//if (!getRepo(REPO_ID_EXPLORER)) {
	if (filteredTaskList.length) {
		const {
			progress: {
				current,
				info,
				total
			},
			//startTime,
			state
		} = filteredTaskList[0];
		//const remainingCount = total - current;
		if(['RUNNING','WAITING'].includes(state)) {
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

	const licenseDetails = validateLicense({appKey: app.name});
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);
	const licenseValid = !!(licenseDetails && !licenseDetails.expired);
	//log.info(`licenseValid:${toStr(licenseValid)}`);

	const propsObj = {
		licensedTo: licenseDetails ? `Licensed to ${licenseDetails.issuedTo}` : 'Unlicensed',
		licenseValid,
		servicesBaseUrl: serviceUrl({service: ''}),
		wsBaseUrl: serviceUrl({service: '', type: 'absolute'}).replace('http', 'ws')
	};

	const collectorsAppToUri = {};
	queryCollectors({
		connection: connect({principals: PRINCIPAL_EXPLORER_READ})
	}).hits.forEach(({
		_name: collectorId,
		appName,
		configAssetPath
	}) => {
		collectorsAppToUri[collectorId] = assetUrl({
			application: appName,
			path: configAssetPath
		});
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
		<script type="text/javascript" src="${assetUrl({path: 'react/react.development.js'})}"></script>
		<script type="text/javascript" src="${assetUrl({path: 'react-dom/react-dom.development.js'})}"></script>
		<link rel="shortcut icon" href="${assetUrl({path: 'favicon.ico'})}">
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'semantic-ui-css/semantic.css'})}">
		<title>Explorer</title>
	</head>
	<body style="background-color: white !important;">
		<div id="${ID_REACT_EXPLORER_CONTAINER}"/>
		<script type="text/javascript" src="${assetUrl({path: 'explorer.js'})}"></script>
		<script type='module' defer>
			import {Explorer} from '${assetUrl({path: 'react/Explorer.esm.js'})}';
			const propsObj = eval(${serialize(propsObj)});
			const collectorComponents = {};
			${Object.keys(collectorsAppToUri).map((a, i) => `import {Collector as Collector${i}} from '${collectorsAppToUri[a]}';
collectorComponents['${a}'] = Collector${i};`)
		.join('\n')}
			propsObj.collectorComponents = collectorComponents;
			ReactDOM.render(
				React.createElement(Explorer, propsObj),
				document.getElementById('${ID_REACT_EXPLORER_CONTAINER}')
			);
		</script>
	</body>
</html>`,
		contentType: 'text/html; charset=utf-8',
		status
	};
}


/*
$('.ui.checkbox').checkbox();
<script type="text/javascript" src="${assetUrl({path: 'scripts.js'})}"></script>
*/
