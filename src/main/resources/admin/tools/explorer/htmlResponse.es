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
	bodyBegin = [],
	bodyEnd = [],
	headBegin = [],
	headEnd = [],
	main = '',
	messages = [],
	path = TOOL_PATH,
	title = '',
	status = 200
} = {}) {
	//log.info(toStr({path}));
	const relPath = path.replace(TOOL_PATH, ''); //log.info(toStr({relPath}));
	const pathParts = relPath.match(/[^/]+/g); //log.info(`pathParts:${pathParts}`);
	const tab = pathParts ? pathParts[0] : ''; //log.info(toStr({tab}));
	const action = pathParts ? pathParts[1] : ''; //log.info(`action:${action}`);
	const preTitle = title ? `${title} - ` : '';
	const messagesArray = forceArray(messages);
	const statusInt = parseInt(status);

	const licenseDetails = validateLicense({appKey: app.name});
	//log.info(`licenseDetails:${toStr(licenseDetails)}`);
	const licenseValid = licenseDetails && !licenseDetails.expired;

	const propsObj = {
		servicesBaseUrl: serviceUrl({service: ''})
	};

	const collectorsAppToUri = {};
	queryCollectors({
		connection: connect({principals: PRINCIPAL_EXPLORER_READ})
	}).hits.forEach(({
		_name: application, configAssetPath
	}) => {
		collectorsAppToUri[application] = assetUrl({
			application,
			path: configAssetPath
		});
	});

	return {
		body: `<html>
	<head>
		<script type="text/javascript" src="${assetUrl({path: 'react/react.development.js'})}"></script>
		<!--
			<script type="text/javascript" src="${assetUrl({path: 'react/react.production.min.js'})}"></script>
		-->

		<script type="text/javascript" src="${assetUrl({path: 'react-dom/react-dom.development.js'})}"></script>
		<!--
			<script type="text/javascript" src="${assetUrl({path: 'react-dom/react-dom.production.min.js'})}"></script>
		-->

		<!--script type="text/javascript" src="${assetUrl({path: 'tslib/tslib.js'})}"></script-->
		<!--script type="text/javascript" src="${assetUrl({path: 'tslib/tslib.es6.js'})}"></script--><!-- Unexpected token export -->

		<!--
			<script type="text/javascript" src="${assetUrl({path: 'formik/formik.umd.development.js'})}"></script>
			<script type="text/javascript" src="${assetUrl({path: 'formik/formik.cjs.development.js'})}"></script>
			<script type="text/javascript" src="${assetUrl({path: 'formik/formik.cjs.production.js'})}"></script>
			<script type="text/javascript" src="${assetUrl({path: 'formik/formik.umd.production.js'})}"></script>
			<script src="https://unpkg.com/formik/dist/formik.umd.production.js"></script>
		-->

		${''/*headBegin.join('\n')*/}

		<title>${preTitle}Explorer</title>
		<link rel="shortcut icon" href="${assetUrl({path: 'favicon.ico'})}">

		<!--link rel="stylesheet" type="text/css" href="${assetUrl({path: 'style.css'})}"-->
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'semantic-ui/semantic.css'})}">

		<!-- Common style and library used by the Launcher Panel -->
		<!--link rel="stylesheet" type="text/css" href="${assetUrl({path: '/admin/common/styles/_all.css'})}"-->

		<!-- Append the Admin libraries -->
		<script type="text/javascript" src="${assetUrl({path: '/admin/common/lib/_all.js'})}"></script>

		${''/*headEnd.join('\n')*/}
	</head>
	<body style="background-color: white !important;">
		${''/*bodyBegin.join('\n')*/}

		<div id="${ID_REACT_EXPLORER_CONTAINER}"/>

		<script type="text/javascript">
		var CONFIG = {
			adminUrl: '${getBaseUri()}',
			appId: '${app.name}',
			launcherUrl: '${getLauncherUrl()}'
		};
		</script>

		<script type="text/javascript" src="${assetUrl({path: 'explorer.js'})}"></script>
		<script type="text/javascript" src="${assetUrl({path: 'jquery/jquery.js'})}"></script>
		<script type="text/javascript">
			jQuery = $;
		</script>
		<script type="text/javascript" src="${assetUrl({path: 'semantic-ui/semantic.js'})}"></script>
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
			});*/
		</script>

		<!-- Append the Admin UI -->
		<script type="text/javascript" src="${assetUrl({path: '/admin/common/js/_all.js'})}"></script>

		<!-- Append the launcher -->
		<script type="text/javascript" src="${getLauncherPath()}" async></script>

		<script src="https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll/dist/smooth-scroll.polyfills.min.js"></script>

		<script type="text/javascript">
    		var scroll = new SmoothScroll('a[href*="#"]');
		</script>

		<script type='module' defer>
			import {Explorer} from '${assetUrl({path: 'react/Explorer.esm.js'})}';
			const propsObj = eval(${serialize(propsObj)});
			const collectorsObj = {};
			${Object.entries(collectorsAppToUri)
		.map(([a, u], i) => `import {Collector as Collector${i}} from '${u}';
collectorsObj['${a}'] = Collector${i};`)
		.join('\n')}
			propsObj.collectorsObj = collectorsObj;
			ReactDOM.render(
				React.createElement(Explorer, propsObj),
				document.getElementById('${ID_REACT_EXPLORER_CONTAINER}')
			);
		</script>

		${''/*bodyEnd.join('\n')*/}
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
