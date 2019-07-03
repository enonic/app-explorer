import {htmlResponse} from '/admin/tools/explorer/htmlResponse';


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
	${item({
		header: 'Classnames',
		href: 'https://github.com/JedWatson/classnames/blob/master/LICENSE'
	})}
	${item({
		header: 'Formik',
		href: 'https://github.com/jaredpalmer/formik/blob/master/LICENSE'
	})}
	${item({
		header: 'jsUri',
		description: 'MIT?',
		href: 'https://github.com/derek-watson/jsUri/blob/master/LICENSE'
	})}
	${item({
		header: 'Moment.js',
		description: 'MIT?',
		href: 'https://github.com/moment/moment/blob/develop/LICENSE'
	})}
	${item({
		header: 'pretty-ms',
		description: 'MIT?',
		href: 'https://github.com/sindresorhus/pretty-ms/blob/master/license'
	})}
	${item({
		header: 'React and React-dom',
		href: 'https://github.com/facebook/react/blob/master/LICENSE'
	})}
	${item({
		header: 'react-scrollspy',
		href: 'https://github.com/makotot/react-scrollspy/blob/master/LICENSE'
	})}
	${item({
		header: 'Semantic UI',
		href: 'https://github.com/Semantic-Org/Semantic-UI/blob/master/LICENSE.md'
	})}
	${item({
		header: 'Semantic UI React',
		href: 'https://github.com/jhudson8/react-semantic-ui/blob/master/LICENSE'
	})}
	${item({
		header: 'traverse',
		description: 'MIT/X11',
		href: 'https://github.com/substack/js-traverse/blob/master/LICENSE'
	})}
	${item({
		header: 'uuid',
		href: 'https://github.com/kelektiv/node-uuid/blob/master/LICENSE.md'
	})}
</div>
`,
		messages,
		path,
		status,
		title: 'About'
	});
}
