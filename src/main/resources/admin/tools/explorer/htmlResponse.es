import serialize from 'serialize-javascript';

import {validateLicense} from '/lib/license';
//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {
	getBaseUri,
	getLauncherPath,
	getLauncherUrl
} from '/lib/xp/admin';
import {assetUrl, serviceUrl} from '/lib/xp/portal';

import {
	PRINCIPAL_EXPLORER_READ,
	TOOL_PATH
} from '/lib/explorer/model/2/constants';
import {connect} from '/lib/explorer/repo/connect';
import {query as queryCollectors} from '/lib/explorer/collector/query';


const ID_REACT_EXPLORER_CONTAINER = 'reactExplorerContainer';


export function htmlResponse({
	path = TOOL_PATH,
	title = '',
	status = 200
} = {}) {
	//log.info(toStr({path}));
	const preTitle = title ? `${title} - ` : '';

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
*/

	return {
		body: `<html>
	<head>
		<script type="text/javascript" src="${assetUrl({path: 'react/react.development.js'})}"></script>
		<script type="text/javascript" src="${assetUrl({path: 'react-dom/react-dom.development.js'})}"></script>
		<link rel="shortcut icon" href="${assetUrl({path: 'favicon.ico'})}">
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'semantic-ui/semantic.css'})}">
		<title>${preTitle}Explorer</title>
	</head>
	<body style="background-color: white !important;">
		<div id="${ID_REACT_EXPLORER_CONTAINER}"/>
		<script type="text/javascript" src="${assetUrl({path: 'explorer.js'})}"></script>
		<script type="text/javascript" src="${assetUrl({path: 'jquery/jquery.js'})}"></script>
		<script type="text/javascript">
			jQuery = $; // Needed by semantic-ui
		</script>
		<script type="text/javascript" src="${assetUrl({path: 'semantic-ui/semantic.js'})}"></script>

		<script src="https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll/dist/smooth-scroll.polyfills.min.js"></script>

		<script type="text/javascript">
    		var scroll = new SmoothScroll('a[href*="#"]');
		</script>

		<script type='module' defer>
			import {Explorer} from '${assetUrl({path: 'react/Explorer.esm.js'})}';
			const propsObj = eval(${serialize(propsObj)});
			const collectorComponents = {};
			${Object.entries(collectorsAppToUri)
		.map(([a, u], i) => `import {Collector as Collector${i}} from '${u}';
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
