/* eslint-disable no-console */
import path from 'path';
import BrowserSyncPlugin from 'browser-sync-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'; // Supports ECMAScript2015
import {webpackEsmAssets} from '@enonic/webpack-esm-assets'
import {webpackServerSideJs} from '@enonic/webpack-server-side-js'
import {webpackStyleAssets} from '@enonic/webpack-style-assets'
import webpack from 'webpack';

//console.debug(process.env.NODE_ENV);

const MODE = 'development';
//const MODE = 'production';

const SRC_DIR = 'src/main/resources';
const SRC_DIR_ABS = path.resolve(__dirname, SRC_DIR);
const SRC_ASSETS_DIR_ABS = path.resolve(SRC_DIR_ABS, 'assets');

const DST_DIR = 'build/resources/main';
const DST_DIR_ABS = path.join(__dirname, DST_DIR);
const DST_ASSETS_DIR_ABS = path.join(DST_DIR_ABS, 'assets');


const STATS = {
	colors: true,
	hash: false,
	maxModules: 0,
	modules: false,
	moduleTrace: false,
	timings: false,
	version: false
};

const CS_MINIMIZER = [];
if(MODE === 'production') {
	CS_MINIMIZER.push(new TerserPlugin({
		terserOptions: {
			compress: {},
			mangle: true // Note `mangle.properties` is `false` by default.
		}
	}));
}

const CLIENT_JS_CONFIG = {
	context: SRC_ASSETS_DIR_ABS,
	entry: './react/index.jsx',
	externals: [
		//'react' // semantic-ui-react fails if this is commented in
	],
	devtool: false, // Don't waste time generating sourceMaps
	//devtool: 'source-map',
	mode: MODE,
	module: {
		rules: [{
			test: /\.jsx$/,
			exclude: /node_modules/,
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
						['@babel/plugin-transform-runtime', {
				      		regenerator: true
				    	}],
						'array-includes'
					],
					presets: [
						'@babel/preset-env',
						'@babel/preset-react'
					]
				} // options
			}]
		}]
	},
	optimization: {
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
		new CopyWebpackPlugin([
			//{ from: 'frappe-gantt/dist/*', to: 'frappe-gantt/[name].[ext]' },
			{ from: 'jquery/dist', to: 'jquery'},
			{ from: 'react/umd/react.*.js', to: 'react/[name].[ext]' },
			{ from: 'react-dom/umd/react-dom.*.js', to: 'react-dom/[name].[ext]' },
			{ from: 'semantic-ui/dist', to: 'semantic-ui'},
		], {
			context: path.resolve(__dirname, 'node_modules')
		}),
		new CopyWebpackPlugin([
			{ from: 'js', to: 'js'}
		], {
			context: path.resolve(__dirname, SRC_DIR, 'assets')
		})
	],
	resolve: {
		extensions: ['.es', '.js', '.jsx']
	},
	stats: STATS
};
//console.log(`CLIENT_JS_CONFIG:${toStr(CLIENT_JS_CONFIG)}`); process.exit();

const SS_ALIAS = {
	// Fixes: TypeError: Cannot read property "TYPED_ARRAY_SUPPORT" from undefined
	myGlobal: path.resolve(__dirname, 'src/main/resources/tasks/webcrawl/global')
};

// Avoid bundling and transpile library files seperately.
// To do that you would have to list all files in SS_FILES!
//SS_EXTERNALS.push(/^\/admin\/tools\/explorer/);
// So instead lets: Resolve dependencies within library and bundle them:
SS_ALIAS['/admin/tools/explorer'] = path.resolve(__dirname, 'src/main/resources/admin/tools/explorer/');

const SS_EXTERNALS = [
	/\/lib\/cache/,
	'/lib/galimatias',
	/\/lib\/http-client/,
	/\/lib\/license/,
	/\/lib\/router/,
	/\/lib\/xp\//
];

const SS_FILES = [
	'src/main/resources/admin/tools/explorer/explorer',
	'src/main/resources/main',
	'src/main/resources/services/collectionCollect/collectionCollect',
	'src/main/resources/services/collectionCreate/collectionCreate',
	'src/main/resources/services/collectionDelete/collectionDelete',
	'src/main/resources/services/collectionDuplicate/collectionDuplicate',
	'src/main/resources/services/collectionList/collectionList',
	'src/main/resources/services/collectionModify/collectionModify',
	'src/main/resources/services/collectorStop/collectorStop',
	'src/main/resources/services/cronJobList/cronJobList',
	'src/main/resources/services/fieldCreate/fieldCreate',
	'src/main/resources/services/fieldDelete/fieldDelete',
	'src/main/resources/services/fieldList/fieldList',
	'src/main/resources/services/fieldModify/fieldModify',
	'src/main/resources/services/fieldValueCreateOrUpdate/fieldValueCreateOrUpdate',
	'src/main/resources/services/fieldValueDelete/fieldValueDelete',
	'src/main/resources/services/fieldValueList/fieldValueList',
	'src/main/resources/services/interfaceCopy/interfaceCopy',
	'src/main/resources/services/interfaceCreate/interfaceCreate',
	'src/main/resources/services/interfaceDelete/interfaceDelete',
	'src/main/resources/services/interfaceExists/interfaceExists',
	'src/main/resources/services/interfaceGet/interfaceGet',
	'src/main/resources/services/interfaceList/interfaceList',
	'src/main/resources/services/interfaceModify/interfaceModify',
	'src/main/resources/services/notifications/notifications',
	'src/main/resources/services/stopWordsCreateOrUpdate/stopWordsCreateOrUpdate',
	'src/main/resources/services/stopWordsDelete/stopWordsDelete',
	'src/main/resources/services/stopWordsList/stopWordsList',
	'src/main/resources/services/journals/journals',
	'src/main/resources/services/listCollectors/listCollectors',
	'src/main/resources/services/search/search',
	'src/main/resources/services/synonymCreate/synonymCreate',
	'src/main/resources/services/synonymDelete/synonymDelete',
	'src/main/resources/services/synonymModify/synonymModify',
	'src/main/resources/services/thesauri/thesauri',
	'src/main/resources/services/thesaurusCreate/thesaurusCreate',
	'src/main/resources/services/thesaurusDelete/thesaurusDelete',
	'src/main/resources/services/thesaurusExport/thesaurusExport',
	'src/main/resources/services/thesaurusImport/thesaurusImport',
	'src/main/resources/services/thesaurusList/thesaurusList',
	'src/main/resources/services/thesaurusUpdate/thesaurusUpdate',
	'src/main/resources/services/uninstallLicense/uninstallLicense',
	//'src/main/resources/services/uploadLicense/uploadLicense',
	'src/main/resources/tasks/webcrawl/webcrawl'
];

const SS_PLUGINS = [
	new webpack.ProvidePlugin({
		global: 'myGlobal' // Without it will get: Cannot read property "ES6" from undefined
	})
];

if (MODE === 'production') {
	SS_EXTERNALS.push('/lib/cron');
	SS_EXTERNALS.push(/^\/lib\/explorer\//);
	SS_EXTERNALS.push('/lib/util');
	SS_EXTERNALS.push(/^\/lib\/util\//);
} else {
	SS_ALIAS['/lib/cron'] = path.resolve(__dirname, '../lib-cron/src/main/resources/lib/cron/');
	SS_ALIAS['/lib/explorer'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/');
	SS_ALIAS['/lib/util'] = path.resolve(__dirname, '../lib-util/src/main/resources/lib/util');
	SS_PLUGINS.push(new BrowserSyncPlugin({
		host: 'localhost',
		port: 3000,
		proxy: 'http://localhost:8080/'
	}));
}

const WEBPACK_CONFIG = [webpackServerSideJs({
	__dirname,
	externals: SS_EXTERNALS,
	serverSideFiles: SS_FILES,
	optimization: {
    	minimizer: [
			new TerserPlugin(/*{
				terserOptions: {
					compress: {}
					//mangle: true // This will DESTROY exports!
				}
			}*/)
		]
	},
	plugins: SS_PLUGINS,
	mode: MODE,
	resolveAlias: SS_ALIAS
}), webpackStyleAssets({
	__dirname,
	mode: MODE
}), CLIENT_JS_CONFIG, webpackEsmAssets({
	__dirname,
	assetFiles: [
		'src/main/resources/assets/react/Explorer.jsx',
		'src/main/resources/assets/react/WebCrawler.jsx'
	],
	externals: [
		// Unable to load these via script or module:
		//'formik',
		//'semantic-ui-react',
		//'react',
		//'react-scrollspy',
		//'uuid/v4',
		//'traverse'
	],
	mode: MODE,
	optimization: {
    	minimizer: [
			new TerserPlugin(/*{
				terserOptions: {
					compress: {}
					//mangle: true // This will DESTROY exports!
				}
			}*/)
		]
	},
	plugins: MODE === 'development' ? [
		new BrowserSyncPlugin({
			host: 'localhost',
			port: 3002,
			proxy: 'http://localhost:8080/'
		})
	] : [],
	resolveAlias: {
		'semantic-ui-react-form': path.resolve(__dirname, '../enonic-npm-modules/packages/semantic-ui-react-form/src')
	}
})];

//console.log(`WEBPACK_CONFIG:${JSON.stringify(WEBPACK_CONFIG, null, 4)}`);
//process.exit();

export { WEBPACK_CONFIG as default };
