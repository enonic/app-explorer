/* eslint-disable no-console */
import path from 'path';
//import BrowserSyncPlugin from 'browser-sync-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import {
	ESBuildMinifyPlugin,
	ESBuildPlugin
} from 'esbuild-loader';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import postcssPresetEnv from 'postcss-preset-env';
import {print} from 'q-i';
import TerserPlugin from 'terser-webpack-plugin';

import webpack from 'webpack';

import {
	BOOL_LOCAL_JS_UTILS,
	BOOL_LOCAL_LIB_EXPLORER,
	BOOL_LOCAL_SEMANTIC_UI_REACT_FORM,
	BOOL_MINIMIZE,
	MODE
} from './.webpack.constants.js';


// Check which version of node is used
print({
	//env: process.env,
	execPath: process.execPath,
	version: process.version
}, { maxItems: Infinity });

//──────────────────────────────────────────────────────────────────────────────
// Common constants
//──────────────────────────────────────────────────────────────────────────────
const SRC_DIR = 'src/main/resources';
const DST_DIR = 'build/resources/main';

const STATS = {
	colors: true,
	hash: false,
	modules: false,
	moduleTrace: false,
	timings: false,
	version: false
};

const WEBPACK_CONFIG = [];

const dict = arr => Object.assign(...arr.map(([k, v]) => ({ [k]: v })));

//──────────────────────────────────────────────────────────────────────────────
// Enonic XP serverside javascript (Explorer admin tool and services)
//──────────────────────────────────────────────────────────────────────────────
//const SS_ESBUILD_TARGET = 'es2015';

const SRC_DIR_ABS = path.resolve(__dirname, SRC_DIR);
const DST_DIR_ABS = path.join(__dirname, DST_DIR);

const SS_ALIAS = {
	'@enonic/nashorn-polyfills': path.resolve(__dirname, 'src/main/resources/lib/nashorn/index.es'),
	'@enonic/js-utils': BOOL_LOCAL_LIB_EXPLORER
		? BOOL_LOCAL_JS_UTILS
			? path.resolve(__dirname, '../enonic-js-utils/dist/cjs/index.js')
			: path.resolve(__dirname, './node_modules/@enonic/js-utils/dist/cjs/index.js')
		: BOOL_LOCAL_JS_UTILS
			? path.resolve(__dirname, '../enonic-js-utils/src/index.ts')
			: path.resolve(__dirname, './node_modules/@enonic/js-utils/src/index.ts') // This is used in production build
};

// Avoid bundling and transpile library files seperately.
// To do that you would have to list all files in SS_FILES!
//SS_EXTERNALS.push(/^\/admin\/tools\/explorer/);
// So instead lets: Resolve dependencies within library and bundle them:
SS_ALIAS['/admin/tools/explorer'] = path.resolve(__dirname, 'src/main/resources/admin/tools/explorer/');

const SS_EXTERNALS = [
	/\/lib\/cache/,
	'/lib/galimatias',
	'/lib/graphql',
	'/lib/graphql-connection',
	'/lib/guillotine',
	/\/lib\/http-client/,
	/\/lib\/license/,
	/\/lib\/router/,

	///^\/lib\/xp\/.+/
	'/lib/xp/admin',
	'/lib/xp/auth',
	'/lib/xp/cluster',
	'/lib/xp/common',
	'/lib/xp/content',
	'/lib/xp/context', // Needed by lib-explorer
	'/lib/xp/event',
	'/lib/xp/i18n', // Needed by lib-explorer
	'/lib/xp/io',
	'/lib/xp/mail', // Needed by lib-explorer
	'/lib/xp/node', // Needed by lib-explorer
	'/lib/xp/portal',
	'/lib/xp/scheduler', // Needed by lib-explorer
	'/lib/xp/repo',
	'/lib/xp/task',
	'/lib/xp/value',
	'/lib/xp/value.js',
	'/lib/xp/websocket'
];

if (BOOL_LOCAL_LIB_EXPLORER) {
	SS_ALIAS['/lib/explorer'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/');
	//SS_ALIAS['/lib/explorer'] = path.resolve(__dirname, '../lib-explorer/build/resources/main/lib/explorer/');
} else {
	SS_EXTERNALS.push(/^\/lib\/explorer\//);
}

const SS_FILES = [
	'admin/tools/explorer/explorer',
	//'lib/fnv', // Not in use
	'lib/locales',
	'lib/licensing',
	'main',
	'services/apiKeyCreate/apiKeyCreate',
	'services/apiKeyDelete/apiKeyDelete',
	'services/apiKeyModify/apiKeyModify',
	'services/collectionCollect/collectionCollect',
	'services/collectionDelete/collectionDelete',
	'services/collectionDuplicate/collectionDuplicate',
	'services/collectorStop/collectorStop',
	'services/graphQL/graphQL',
	'services/interfaceCopy/interfaceCopy',
	'services/interfaceExists/interfaceExists',
	'services/longPolling/longPolling',
	'services/notifications/notifications',
	'services/stopWordsCreateOrUpdate/stopWordsCreateOrUpdate',
	'services/stopWordsDelete/stopWordsDelete',
	'services/stopWordsList/stopWordsList',
	'services/journals/journals',
	'services/listCollectors/listCollectors',
	//'services/search/search',
	'services/thesauri/thesauri',
	'services/thesaurusExport/thesaurusExport',
	'services/thesaurusImport/thesaurusImport',
	'services/uninstallLicense/uninstallLicense',
	'services/uploadLicense/uploadLicense',
	'services/ws/ws',
	'tasks/init/init',
	'tasks/reindexCollection/reindexCollection',
	'tasks/test/test',
	'tasks/webcrawl/webcrawl',
	'webapp/webapp'
];

const SS_PLUGINS = [
	new CaseSensitivePathsPlugin(),
	//new ESBuildPlugin(),
	new webpack.ProvidePlugin({
		/* ERROR: For some reason this breaks the webcrawl task!
		console: { // Attempt at avoiding ReferenceError: "console" is not defined
			assert: (params) => {log.debug(params)},
			clear: () => {log.warning('console.clear called')},
			count: () => {log.warning('console.count called')},
			countReset: () => {log.warning('console.countReset called')},
			debug: (params) => {log.debug(params)},
			dir: (params) => {log.debug(params)},
			dirxml: (params) => {log.debug(params)},
			error: (params) => {log.error(params)},
			exception: (params) => {log.error(params)},
			group: () => {log.warning('console.group called')},
			groupCollapsed: () => {log.warning('console.groupCollapsed called')},
			groupEnd: () => {log.warning('console.groupEnd called')},
			info: (params) => {log.info(params)},
			log: (params) => {log.info(params)},
			profile: (params) => {log.debug(params)},
			profileEnd: () => {log.warning('console.profileEnd called')},
			table: (params) => {log.info(params)},
			time: () => {log.warning('console.time called')},
			timeEnd: () => {log.warning('console.timeEnd called')},
			timeLog: () => {log.warning('console.timeLog called')},
			timeStamp: () => {log.warning('console.timeStamp called')},
			trace: (params) => {log.debug(params)},
			warn: (params) => {log.warning(params)}
		},*/
		Buffer: ['buffer', 'Buffer'],

		// Not always polyfilled only when identifier global found
		global: path.resolve(__dirname, 'src/main/resources/lib/nashorn/global.es')
	})
];

if (MODE === 'production') {
	SS_EXTERNALS.push('/lib/util');
	SS_EXTERNALS.push(/^\/lib\/util\//);
} else {
	SS_ALIAS['/lib/util'] = path.resolve(__dirname, '../lib-util/src/main/resources/lib/util');
	/*SS_PLUGINS.push(new BrowserSyncPlugin({
		host: 'localhost',
		port: 3000,
		proxy: 'http://localhost:8080/'
	}));*/
}

const SS_JS_CONFIG = {
	context: path.resolve(__dirname, SRC_DIR),
	devtool: false, // Don't waste time generating sourceMaps
	entry: dict(
		SS_FILES.map(k => [
			k, // name
			`./${k}.es` // source relative to context
		])
	),
	externals: SS_EXTERNALS,
	mode: MODE,
	module: {
		rules: [{
			//test: /\.es$/,

			// TypeError: isObject is not a function

			// NOTE ECMAScript Modules doesn't support named imports :(
			// Thus we skip *.mjs
			// No need to support pure client-side files either: *.jsx *.tsx
			test: /\.(es6?|ts|js)$/, // Will need js for node module depenencies

			exclude: [ // It takes time to transpile, if you know they don't need transpilation to run in Enonic you may list them here:
				/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
				/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
			],

			use: [{
				loader: 'babel-loader',
				options: {
					babelrc: false, // The .babelrc file should only be used to transpile config files.
					comments: false,
					compact: false,
					minified: false,
					plugins: [
						'@babel/plugin-transform-arrow-functions',
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-proposal-export-default-from', // export v from 'mod'; // I think it adds a default export
						'@babel/plugin-proposal-export-namespace-from', // export * as ns from 'mod';
						'@babel/plugin-proposal-object-rest-spread',
						'@babel/plugin-syntax-dynamic-import', // Allow parsing of import()
						'@babel/plugin-syntax-throw-expressions',
						'@babel/plugin-transform-block-scoped-functions',
						'@babel/plugin-transform-block-scoping',
						'@babel/plugin-transform-classes', // tasks/syncSite/Progress.es
						'@babel/plugin-transform-computed-properties',
						'@babel/plugin-transform-destructuring',
						'@babel/plugin-transform-duplicate-keys',
						'@babel/plugin-transform-for-of',
						'@babel/plugin-transform-function-name',
						'@babel/plugin-transform-instanceof',
						'@babel/plugin-transform-literals',
						'@babel/plugin-transform-new-target',
						'@babel/plugin-transform-member-expression-literals',
						'@babel/plugin-transform-modules-commonjs', // transforms ECMAScript modules to CommonJS
						'@babel/plugin-transform-object-assign', // Not used locally, perhaps in node_modules?
						'@babel/plugin-transform-object-super',
						'@babel/plugin-transform-parameters',
						'@babel/plugin-transform-property-literals',
						'@babel/plugin-transform-property-mutators',
						'@babel/plugin-transform-reserved-words',
						'@babel/plugin-transform-shorthand-properties',
						'@babel/plugin-transform-spread',
						'@babel/plugin-transform-sticky-regex',
						'@babel/plugin-transform-template-literals',
						'@babel/plugin-transform-typeof-symbol',
						'@babel/plugin-transform-unicode-escapes', // This plugin is included in @babel/preset-env
						'@babel/plugin-transform-unicode-regex',
						'array-includes'
					],
					presets: [
						'@babel/preset-typescript',
						[
							'@babel/preset-env',
							{
								corejs: 3, // Needed when useBuiltIns: usage

								// Enables all transformation plugins and as a result,
								// your code is fully compiled to ES5
								forceAllTransforms: true,

								targets: {
									esmodules: false, // Enonic XP doesn't support ECMAScript Modules

									// https://node.green/
									node: '0.10.48'
									//node: '5.12.0'

								},

								//useBuiltIns: false // no polyfills are added automatically
								useBuiltIns: 'entry' // replaces direct imports of core-js to imports of only the specific modules required for a target environment
								//useBuiltIns: 'usage' // polyfills will be added automatically when the usage of some feature is unsupported in target environment
							}
						]
					]
				} // options
			}/*, { // RUNTIME ERROR: ES6 destructuring is not yet implemented
				loader: 'esbuild-loader',
				options: {
					format: 'cjs', // Does this option exist? At least it doesn't complain
					loader: 'js', // js, jsx, ts, tsx, json, text, base64, file, dataurl, binary
					//platform: 'browser', // error: Invalid option in transform() call: "platform"
					target: SS_ESBUILD_TARGET
				}
			}*/]
		}]
	},
	optimization: {
		minimize: BOOL_MINIMIZE,
		minimizer: BOOL_MINIMIZE ? [
			/*new ESBuildMinifyPlugin({ // ES6 destructuring is not yet implemented
				target: SS_ESBUILD_TARGET
			})*/
		] : []
	},
	output: {
		filename: '[name].js',
		libraryTarget: 'commonjs',
		path: path.join(__dirname, DST_DIR)
	},
	performance: {
		hints: false
	},
	plugins: SS_PLUGINS,
	resolve: {
		alias: SS_ALIAS,
		extensions: [
			//'mjs', // NOTE ECMAScript Modules doesn't support named imports :(
			'es', // Needed to resolve "local" imports starting with / which are .es files
			//'esm', // NOTE ECMAScript Modules doesn't support named imports :(
			//'es6',
			'js', // Needed to resolve node_modules
			//'jsx', // Client-side only
			'ts'//,
			//'tsx', // Client-side only
			//'json'
		].map(ext => `.${ext}`)
	},
	stats: STATS
};
//print({SS_JS_CONFIG}, { maxItems: Infinity });
//process.exit();
WEBPACK_CONFIG.push(SS_JS_CONFIG);

//──────────────────────────────────────────────────────────────────────────────
// Assets (sass)
//──────────────────────────────────────────────────────────────────────────────
const SRC_ASSETS_DIR = `${SRC_DIR}/assets`;
const SRC_ASSETS_DIR_ABS = path.resolve(SRC_DIR_ABS, 'assets');

const DST_ASSETS_DIR = `${DST_DIR}/assets`;
const DST_ASSETS_DIR_ABS = path.join(DST_DIR_ABS, 'assets');


const SRC_STYLE_DIR = `${SRC_ASSETS_DIR}/style`;
const DST_STYLE_DIR = `${DST_ASSETS_DIR}/style`;

const STYLE_OUTPUT_PATH = path.join(__dirname, '.build');
const STYLE_OUTPUT_FILENAME = 'bundle';

const STYLE_USE = [
	MiniCssExtractPlugin.loader,
	{
		loader: 'css-loader', // translates CSS into CommonJS
		options: { importLoaders: 1 }
	},
	{
		loader: 'postcss-loader',
		options: {
			//ident: 'postcss',
			postcssOptions: {
				plugins: () => [postcssPresetEnv()]
			}
		}
	}
];

const STYLE_CONFIG = {
	context: path.resolve(__dirname, SRC_STYLE_DIR),
	devtool: false, // Don't waste time generating sourceMaps
	entry: {
		'main': './main.sass'
	},
	mode: MODE,
	module: {
		rules: [
			{
				test: /\.(c|le|sa|sc)ss$/,
				use: [
					...STYLE_USE,
					// 'less-loader', // compiles Less to CSS
					'sass-loader' // compiles Sass to CSS
				]
			},
			{
				test: /\.styl$/,
				use: [
					...STYLE_USE,
					'stylus-loader' // compiles Stylus to CSS
				]
			},
			{
				test: /\.svg/,
				use: {
					loader: 'svg-url-loader',
					options: {}
				}
			}
		]
	},
	output: {
		filename: 'temporaryStyleBundle.js',
		path: STYLE_OUTPUT_PATH
	},
	plugins: [
		new CaseSensitivePathsPlugin(),
		new CleanWebpackPlugin({
			cleanOnceBeforeBuildPatterns: [STYLE_OUTPUT_PATH],
			verbose: true
		}),
		new MiniCssExtractPlugin({
			filename: `../${DST_STYLE_DIR}/${STYLE_OUTPUT_FILENAME}.css`
		})
	],
	resolve: {
		extensions: ['sass', 'scss', 'less', 'styl', 'css'].map(ext => `.${ext}`)
	},
	stats: STATS
};
//print({STYLE_CONFIG}, { maxItems: Infinity });
//process.exit();
WEBPACK_CONFIG.push(STYLE_CONFIG);

//──────────────────────────────────────────────────────────────────────────────
// Clientside javascript
//──────────────────────────────────────────────────────────────────────────────
const CS_MINIMIZER = [];
if(MODE === 'production') {
	CS_MINIMIZER.push(new TerserPlugin({
		extractComments: false,
		terserOptions: {
			compress: {}//,
			//mangle: true // This will DESTROY exports!
		}
	}));
}

const NODE_MODULES_CONTEXT = path.resolve(__dirname, 'node_modules');
const ASSETS_CONTEXT = path.resolve(__dirname, SRC_DIR, 'assets');

const CLIENT_JS_CONFIG = {
	context: SRC_ASSETS_DIR_ABS,
	entry: './react/index.jsx',
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM'
	},
	devtool: false, // Don't waste time generating sourceMaps
	//devtool: 'source-map',
	mode: MODE,
	module: {
		rules: [{
			test: /\.jsx$/,
			//exclude: /node_modules/, // Perhaps too much?
			exclude: [ // It takes time to transpile, if you know they don't need transpilation to run in Enonic you may list them here:
				/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
				/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
			],
			use: [{
				loader: 'babel-loader',
				options: {
					babelrc: false, // The .babelrc file should only be used to transpile config files.
					comments: false,
					compact: false,
					minified: false,
					plugins: [
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-proposal-object-rest-spread',
						'@babel/plugin-syntax-dynamic-import',
						'@babel/plugin-syntax-throw-expressions',
						'@babel/plugin-transform-object-assign',
						'array-includes'
					],
					presets: [
						[
							'@babel/preset-env',
							{
								corejs: 3,

								// Enables all transformation plugins and as a result,
								// your code is fully compiled to ES5
								forceAllTransforms: true,

								targets: {
									esmodules: false // Enonic XP doesn't support ECMAScript Modules
								},

								useBuiltIns: 'usage' // false means polyfill not required runtime
							}
						],
						'@babel/preset-react'
					]
				} // options
			}]
		}]
	},
	optimization: {
		minimize: BOOL_MINIMIZE,
		minimizer: CS_MINIMIZER
	},
	output: {
		//filename: '[name].js',
		filename: 'explorer.js',
		library: 'explorer',
		libraryTarget: 'umd',
		path: DST_ASSETS_DIR_ABS
	},
	performance: {
		hints: false
	},
	plugins: [
		new CaseSensitivePathsPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{ context: NODE_MODULES_CONTEXT, from: 'fomantic-ui-css/semantic*', to: 'semantic-ui-css/[name][ext]'},
				{ context: NODE_MODULES_CONTEXT, from: 'fomantic-ui-css/themes', to: 'semantic-ui-css/themes'}, // Fonts

				//{ context: NODE_MODULES_CONTEXT, from: 'frappe-gantt/dist/*', to: 'frappe-gantt/[name].[ext]' },
				{ context: NODE_MODULES_CONTEXT, from: 'nice-react-gantt/lib/css/style.css', to: 'nice-react-gantt/style.css' },
				//{ context: NODE_MODULES_CONTEXT, from: 'jquery/dist', to: 'jquery'},
				{ context: NODE_MODULES_CONTEXT, from: 'react/umd/react.*.js', to: 'react/[name][ext]' },
				{ context: NODE_MODULES_CONTEXT, from: 'react-dom/umd/react-dom.*.js', to: 'react-dom/[name][ext]' },
				{ context: NODE_MODULES_CONTEXT, from: 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css', to: 'react-semantic-ui-datepickers/react-semantic-ui-datepickers.css' },

				//{ context: NODE_MODULES_CONTEXT, from: 'semantic-ui-css/semantic*', to: 'semantic-ui-css/[name][ext]'},
				//{ context: NODE_MODULES_CONTEXT, from: 'semantic-ui-css/themes', to: 'semantic-ui-css/themes'}, // Fonts

				//{ context: NODE_MODULES_CONTEXT, from: 'semantic-ui/dist', to: 'semantic-ui'},
				{ context: NODE_MODULES_CONTEXT, from: 'semantic-ui-react/dist', to: 'semantic-ui-react'},
			]
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ context: ASSETS_CONTEXT, from: 'js', to: 'js'}
			]
		})
	],
	resolve: {
		/*alias: { // NOTE: If the local lib-explorer is not the newest there could be trouble...
			'/lib/explorer': path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/')
		},*/
		extensions: [
			'mjs',
			'es',
			'js',
			'jsx',
			'ts',
			'tsx'
		].map(ext => `.${ext}`)
	},
	stats: STATS
};
//print({CLIENT_JS_CONFIG}, { maxItems: Infinity });
//process.exit();
WEBPACK_CONFIG.push(CLIENT_JS_CONFIG);


//──────────────────────────────────────────────────────────────────────────────
// Clientside Ecmascript modules
//──────────────────────────────────────────────────────────────────────────────
const ESBUILD_TARGET = 'es2015';
const CLIENT_ES_CONFIG = {
	context: path.join(__dirname, SRC_ASSETS_DIR, 'react'),
	devtool: false, // Don't waste time generating sourceMaps
	entry: {
		'Explorer': './Explorer.jsx',
		'WebCrawler': './WebCrawler.jsx'
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM'
	},
	mode: MODE,
	module: {
		rules: [{
			exclude: [ // It takes time to transpile, if you know they don't need transpilation to run in Enonic you may list them here:
				/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
				/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
			],
			test: /\.jsx$/,
			loader: 'esbuild-loader',
			options: {
				loader: 'jsx',
				target: ESBUILD_TARGET
			}
		}, {
			exclude: [ // It takes time to transpile, if you know they don't need transpilation to run in Enonic you may list them here:
				/node_modules[\\/]core-js/, // will cause errors if they are transpiled by Babel
				/node_modules[\\/]webpack[\\/]buildin/ // will cause errors if they are transpiled by Babel
			],
			test: /\.tsx?$/,
			loader: 'esbuild-loader',
			options: {
				loader: 'tsx',
				target: ESBUILD_TARGET
			}
		}]
	},
	optimization: {
		minimize: BOOL_MINIMIZE,
		minimizer: MODE === 'production' ? [
			new ESBuildMinifyPlugin({
				target: ESBUILD_TARGET
			})
		] : []
	},
	output: {
		filename: '[name].esm.js',
		//library: 'LIB', // If you try to load to files with the same library name the latter will overwrite the first!!!

		library: 'Lib[name]',
		// Library name base (Libreact/Explorer) must be a valid identifier when using a var declaring library type.
		// Either use a valid identifier (e. g. Libreact_Explorer) or use a different library type
		// (e. g. 'type: "global"', which assign a property on the global scope instead of declaring a variable).
		// Common configuration options that specific library names are
		// 'output.library[.name]', 'entry.xyz.library[.name]', 'ModuleFederationPlugin.name' and 'ModuleFederationPlugin.library[.name]'.

		libraryTarget: 'var',
		//libraryTarget: 'global',
		//libraryTarget: 'window',
		path: path.join(__dirname, DST_ASSETS_DIR, 'react')
	},
	performance: {
		hints: false
	},
	plugins: [
		new CaseSensitivePathsPlugin(),
		new webpack.ProvidePlugin({
			Buffer: ['buffer', 'Buffer']
		}),
		//new EsmWebpackPlugin(), // Webpack 5: Error: Cannot find module 'webpack/lib/MultiModule'
		new ESBuildPlugin()
	],
	resolve: {
		alias: {
			'@enonic/js-utils': BOOL_LOCAL_JS_UTILS
				? path.resolve(__dirname, '../enonic-js-utils/src/index.ts')
				: path.resolve(__dirname, './node_modules/@enonic/js-utils/src/index.ts'),
			'semantic-ui-react-form': BOOL_LOCAL_SEMANTIC_UI_REACT_FORM
				? path.resolve(__dirname, '../semantic-ui-react-form/src')
				: path.resolve(__dirname, './node_modules/@enonic/semantic-ui-react-form/src')//,
			// NOTE: If the local lib-explorer is not the newest there could be trouble...
			//'/lib/explorer': path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/')
		},
		extensions: [
			'mjs', 'jsx', 'esm', 'es', 'es6', 'js', 'json', 'ts', 'tsx'
		].map(ext => `.${ext}`)
	},
	stats: STATS
};
//print({CLIENT_ES_CONFIG}, { maxItems: Infinity });
//process.exit();
WEBPACK_CONFIG.push(CLIENT_ES_CONFIG);

//print({WEBPACK_CONFIG}, { maxItems: Infinity });
//process.exit();

export { WEBPACK_CONFIG as default };
