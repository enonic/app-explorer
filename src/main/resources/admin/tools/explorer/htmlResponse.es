import {TOOL_PATH} from '/lib/explorer/model/2/constants';
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
	const pathParts = relPath.match(/[^/]+/g); //log.info(toStr({pathParts}));
	const tab = pathParts ? pathParts[0] : ''; //log.info(toStr({tab}));
	const preTitle = title ? `${title} - ` : '';
	const messagesArray = forceArray(messages);
	const statusInt = parseInt(status);
	return {
		body: `<html>
	<head>
		<!--script type="text/javascript" src="${assetUrl({path: 'react/react.production.min.js'})}"></script-->
		<script type="text/javascript" src="${assetUrl({path: 'react/react.development.js'})}"></script>

		<!--script type="text/javascript" src="${assetUrl({path: 'react-dom/react-dom.production.min.js'})}"></script-->
		<script type="text/javascript" src="${assetUrl({path: 'react-dom/react-dom.development.js'})}"></script>

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
	<body>
		<nav class="inverted stackable tabular ui menu" id="top">
			<div class="ui container">
				<a class="item ${relPath === '' ? 'active' : ''}" href="${TOOL_PATH}""><i class="search icon"></i> Home</a>
				<a class="item ${tab === 'collections' ? 'active' : ''}" href="${TOOL_PATH}/collections"><i class="database icon"></i> Collections</a>
				<a class="item ${tab === 'fields' ? 'active' : ''}" href="${TOOL_PATH}/fields"><i class="sitemap icon"></i> Fields</a>
				<a class="item ${tab === 'stopwords' ? 'active' : ''}" href="${TOOL_PATH}/stopwords"><i class="crop icon"></i> StopWords</a>
				<a class="item ${tab === 'thesauri' ? 'active' : ''}" href="${TOOL_PATH}/thesauri"><i class="font icon"></i> Thesauri</a>
				<a class="item ${tab === 'interfaces' ? 'active' : ''}" href="${TOOL_PATH}/interfaces"><i class="plug icon"></i> Interfaces</a>
				<!--div class="right item">
					<div class="ui input"><input type="text" placeholder="Search..."></div>
				</div-->
			</div>
		</nav>
		${bodyBegin.join('\n')}
		<main class="ui main container">
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

		<script type="text/javascript" src="${assetUrl({path: 'yase.js'})}"></script>
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
