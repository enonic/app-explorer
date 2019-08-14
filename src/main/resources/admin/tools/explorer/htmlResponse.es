import {TOOL_PATH} from '/lib/explorer/model/2/constants';
import {validateLicense} from '/lib/license';
//import {toStr} from '/lib/util';
import {forceArray} from '/lib/util/data';
import {
	getBaseUri,
	getLauncherPath,
	getLauncherUrl
} from '/lib/xp/admin';
import {assetUrl} from '/lib/xp/portal';

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

		${headBegin.join('\n')}

		<title>${preTitle}Explorer</title>
		<link rel="shortcut icon" href="${assetUrl({path: 'favicon.ico'})}">

		<!--link rel="stylesheet" type="text/css" href="${assetUrl({path: 'style.css'})}"-->
		<link rel="stylesheet" type="text/css" href="${assetUrl({path: 'semantic-ui/semantic.css'})}">

		<!-- Common style and library used by the Launcher Panel -->
		<!--link rel="stylesheet" type="text/css" href="${assetUrl({path: '/admin/common/styles/_all.css'})}"-->

		<!-- Append the Admin libraries -->
		<script type="text/javascript" src="${assetUrl({path: '/admin/common/lib/_all.js'})}"></script>

		${headEnd.join('\n')}
	</head>
	<body class="pushable" style="background-color: white !important;">
		${bodyBegin.join('\n')}

		<header class="fixed inverted menu ui" style="z-index:103;">
			<a class="item" onClick="$('#mySidebar').sidebar('toggle');"><i class="close icon" id="myIcon"></i></a>
			<span class="item">Explorer</span>
		</header>

		<aside class="inverted left menu sidebar ui vertical visible" id="mySidebar">

			<a class="${relPath === '' ? 'active ' : ''}item" href="${TOOL_PATH}""><i class="search icon"></i> Home</a>

			<a class="${tab === 'collections' && !action ? 'active ' : ''}item" href="${TOOL_PATH}/collections"><i class="database icon"></i> Collections</a>
			${tab === 'collections'	? `<div class="inverted menu">
				<a class="${action === 'status' ? 'active ' : ''}item" href="${TOOL_PATH}/collections/status"><i class="cogs icon"></i> Status</a>
				<a class="${action === 'journal' ? 'active ' : ''}item" href="${TOOL_PATH}/collections/journal"><i class="newspaper outline icon"></i> Journal</a>
			</div>`	: ''}

			<a class="${tab === 'fields' ? 'active ' : ''}item" href="${TOOL_PATH}/fields"><i class="sitemap icon"></i> Fields</a>

			<a class="${tab === 'stopwords' ? 'active ' : ''}item" href="${TOOL_PATH}/stopwords"><i class="crop icon"></i> StopWords</a>

			<a class="${tab === 'thesauri' ? 'active ' : ''}item" href="${TOOL_PATH}/thesauri"><i class="font icon"></i> Thesauri</a>
			${tab === 'thesauri' ? `<div class="inverted menu">
				<a class="${action === 'new' ? ' active' : ''}item" href="${TOOL_PATH}/thesauri/new"><i class="green plus icon"></i> New</a>
			</div>` : ''}

			<a class="${tab === 'interfaces' ? 'active ' : ''}item" href="${TOOL_PATH}/interfaces"><i class="plug icon"></i> Interfaces</a>
			${tab === 'interfaces' ? `<div class="inverted menu">
				<a class="${action === 'new' ? ' active' : ''}item" href="${TOOL_PATH}/interfaces/new"><i class="green plus icon"></i> New</a>
			</div>` : ''}

			<a class="${tab === 'about' ? 'active ' : ''}item" href="${TOOL_PATH}/about"><i class="info icon"></i> About</a>
		</aside>

		<main class="pusher" id="myPusher" style="padding:54px 14px 14px;width: calc(100% - 260px)">
			${messagesArray.length ? `<div class="ui icon ${statusInt === 200 ? 'positive' : 'negative'} message">
				<i class="${statusInt === 200 ? 'thumbs up' : 'exclamation triangle'} icon"></i>
				<div class="content">
					<div class="header">${statusInt === 200 ? 'Success' : 'Error'}</div>
					<ul class="list">
						${messagesArray.map(m => `<li>${m}</li>`)}
					</ul>
				</div>
			</div>` : ''}
			${main}
		</main>

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
			$(document).ready(function() {
				$('select.dropdown').dropdown();
				$('table').tablesort();

				const headerHeight = $('header').css('height');
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

		<!-- Append the Admin UI -->
		<script type="text/javascript" src="${assetUrl({path: '/admin/common/js/_all.js'})}"></script>

		<!-- Append the launcher -->
		<script type="text/javascript" src="${getLauncherPath()}" async></script>

		<script src="https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll/dist/smooth-scroll.polyfills.min.js"></script>

		<script type="text/javascript">
    		var scroll = new SmoothScroll('a[href*="#"]');
		</script>

		${bodyEnd.join('\n')}
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
