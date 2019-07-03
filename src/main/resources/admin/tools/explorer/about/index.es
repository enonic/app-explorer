import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


const NODE_MODULES = [{
	header: 'Classnames',
	href: 'https://github.com/JedWatson/classnames/blob/master/LICENSE'
},{
	header: 'd3-dsv', // lib-explorer
	description: 'BSD 3-Clause',
	href: 'https://github.com/d3/d3-dsv/blob/master/LICENSE'
},{
	header: 'deepmerge', // lib-explorer-client
	href: 'https://github.com/TehShrike/deepmerge/blob/master/license.txt'
},{
	header: 'fnv-plus', // lib-explorer
	href: 'https://github.com/tjwebb/fnv-plus#license'
},{
	header: 'Formik',
	href: 'https://github.com/jaredpalmer/formik/blob/master/LICENSE'
},{
	header: 'highlight-search-result', // lib-explorer
	href: 'https://github.com/dominictarr/highlight-search-result/blob/master/LICENSE'
},{
	header: 'jQuery', // lib-explorer
	href: 'https://github.com/jquery/jquery/blob/master/LICENSE.txt'
},{
	header: 'jsUri',
	description: 'MIT?',
	href: 'https://github.com/derek-watson/jsUri/blob/master/LICENSE'
},{
	header: 'Moment.js',
	description: 'MIT?',
	href: 'https://github.com/moment/moment/blob/develop/LICENSE'
},{
	header: 'pretty-ms',
	description: 'MIT?',
	href: 'https://github.com/sindresorhus/pretty-ms/blob/master/license'
},{
	header: 'React and React-dom',
	href: 'https://github.com/facebook/react/blob/master/LICENSE'
},{
	header: 'react-scrollspy',
	href: 'https://github.com/makotot/react-scrollspy/blob/master/LICENSE'
},{
	header: 'Semantic UI',
	href: 'https://github.com/Semantic-Org/Semantic-UI/blob/master/LICENSE.md'
},{
	header: 'Semantic UI React',
	href: 'https://github.com/jhudson8/react-semantic-ui/blob/master/LICENSE'
},{
	header: 'traverse',
	description: 'MIT/X11',
	href: 'https://github.com/substack/js-traverse/blob/master/LICENSE'
},{
	header: 'uuid',
	href: 'https://github.com/kelektiv/node-uuid/blob/master/LICENSE.md'
}];


const item = ({
	header,
	description = 'MIT',
	href
}) => `<div class="item">
  <i class="red large npm middle aligned icon"></i>
  <a class="content" href="${href}">
	<div class="header">${header}</div>
	<div class="description">${description}</div>
  </a>
</div>`


const ITEMS = NODE_MODULES.map(a => item(a)).join('\n');


export const about = ({
	params: {
		messages,
		status
	},
	path
}) => {
	return htmlResponse({
		main: `<h2 class="ui header">Licenses</h2>
<div class="animated divided list relaxed selection ui">
	${ITEMS}
</div>
`,
		messages,
		path,
		status,
		title: 'About'
	});
}
