/* eslint-disable no-console */
import path from 'path';
import BrowserSyncPlugin from 'browser-sync-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'; // Supports ECMAScript2015
import {webpackEsmAssets} from '@enonic/webpack-esm-assets'
import {webpackServerSideJs} from '@enonic/webpack-server-side-js'
import {webpackStyleAssets} from '@enonic/webpack-style-assets'

//const MODE = 'development';
const MODE = 'production';

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

const CLIENT_JS_CONFIG = {
	context: SRC_ASSETS_DIR_ABS,
	entry: './react/index.jsx',
	externals: [
		//'react'
	],
	devtool: false, // Don't waste time generating sourceMaps
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
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {},
					mangle: true // Note `mangle.properties` is `false` by default.
				}
			})
			/*new UglifyJsPlugin({
				parallel: true,
				sourceMap: false
			})*/
		]
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
			//{ from: 'babel-standalone/', to: 'babel-standalone/' },
			{ from: 'formik/dist/formik.*', to: 'formik/[name].[ext]' },
			{ from: 'frappe-gannt/dist/*', to: 'frappe-gannt/[name].[ext]' },
			{ from: 'jquery/dist', to: 'jquery'},
			{ from: 'react/umd/react.*.js', to: 'react/[name].[ext]' },
			{ from: 'react-dom/umd/react-dom.*.js', to: 'react-dom/[name].[ext]' },
			{ from: 'semantic-ui/dist', to: 'semantic-ui'},
			{ from: 'tslib/*.js', to: 'tslib/[name].[ext]'}
			//{ from: 'redux/dist/', to: 'redux/' }
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

const SS_EXTERNALS = [
	/\/lib\/cache/,
	/\/lib\/http-client/,
	/\/lib\/router/,
	/\/lib\/xp\//
];

const SS_ALIAS = {
	'/admin/tools/explorer': path.resolve(__dirname, 'src/main/resources/admin/tools/explorer/')
};

if (MODE === 'production') {
	SS_EXTERNALS.push('/lib/cron');
	SS_EXTERNALS.push(/\/lib\/explorer\//);
	SS_EXTERNALS.push('/lib/util');
	SS_EXTERNALS.push(/\/lib\/util\//);
} else {
	SS_ALIAS['/lib/cron'] = path.resolve(__dirname, '../lib-cron/src/main/resources/lib/cron/');
	SS_ALIAS['/lib/explorer/client'] = path.resolve(__dirname, '../lib-explorer-client/src/main/resources/lib/explorer/client/');

	SS_ALIAS['/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.collection.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.collection.es');
	SS_ALIAS['/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.document.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.document.es');
	SS_ALIAS['/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.field-value.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.field-value.es');
	SS_ALIAS['/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.field.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.field.es');
	SS_ALIAS['/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.interface.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.interface.es');
	SS_ALIAS['/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.journal.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.journal.es');
	SS_ALIAS['/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.stopwords.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.stopwords.es');
	SS_ALIAS['/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.synonym.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.synonym.es');
	SS_ALIAS['/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.thesaurus.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/nodeTypes/com.enonic.app.explorer.thesaurus.es');

	SS_ALIAS['/lib/explorer/model/2/repositories/com.enonic.app.explorer.journals.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/repositories/com.enonic.app.explorer.journals.es');
	SS_ALIAS['/lib/explorer/model/2/repositories/com.enonic.app.explorer.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/repositories/com.enonic.app.explorer.es');

	SS_ALIAS['/lib/explorer/model/2/roles/com.enonic.app.explorer.admin.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/roles/com.enonic.app.explorer.admin.es');
	SS_ALIAS['/lib/explorer/model/2/roles/com.enonic.app.explorer.read.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/roles/com.enonic.app.explorer.read.es');
	SS_ALIAS['/lib/explorer/model/2/roles/com.enonic.app.explorer.write.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/roles/com.enonic.app.explorer.write.es');

	SS_ALIAS['/lib/explorer/model/2/users/com.enonic.app.explorer.js'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/model/2/users/com.enonic.app.explorer.es');

	SS_ALIAS['/lib/explorer'] = path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/');
	SS_ALIAS['/lib/util'] = path.resolve(__dirname, '../lib-util/src/main/resources/lib/util');
}

const WEBPACK_CONFIG = [webpackServerSideJs({
	__dirname,
	externals: SS_EXTERNALS,
	serverSideFiles: [
		'src/main/resources/main',
		'src/main/resources/services/cronJobList/cronJobList',
		'src/main/resources/services/interfaceCopy/interfaceCopy',
		'src/main/resources/services/interfaceDelete/interfaceDelete',
		'src/main/resources/services/interfaceExists/interfaceExists',
		'src/main/resources/services/interfaceList/interfaceList',
		'src/main/resources/services/journals/journals',
		'src/main/resources/services/listCollectors/listCollectors',
		'src/main/resources/services/search/search',
		'src/main/resources/services/thesauri/thesauri',
		'src/main/resources/admin/tools/explorer/explorer'
	],
	optimization: {
    	minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {},
					mangle: true // Note `mangle.properties` is `false` by default.
				}
			})
		]
	},
	plugins: MODE === 'development' ? [
		new BrowserSyncPlugin({
			host: 'localhost',
			port: 3000,
			proxy: 'http://localhost:8080/'
		})
	] : [],
	mode: MODE,
	resolveAlias: SS_ALIAS
}), webpackStyleAssets({
	__dirname,
	mode: MODE
}), CLIENT_JS_CONFIG, webpackEsmAssets({
	__dirname,
	assetFiles: [
		'src/main/resources/assets/react/Collection.jsx',
		'src/main/resources/assets/react/Interface.jsx',
		'src/main/resources/assets/react/Interfaces.jsx',
		'src/main/resources/assets/react/Search.jsx'
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
			new TerserPlugin({
				terserOptions: {
					compress: {},
					mangle: true // Note `mangle.properties` is `false` by default.
				}
			})
		]
	},
	plugins: MODE === 'development' ? [
		new BrowserSyncPlugin({
			host: 'localhost',
			port: 3002,
			proxy: 'http://localhost:8080/'
		})
	] : []
})];

//console.log(`WEBPACK_CONFIG:${JSON.stringify(WEBPACK_CONFIG, null, 4)}`);
//process.exit();

export { WEBPACK_CONFIG as default };
