/* eslint-disable no-console */
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'; // Supports ECMAScript2015
import {webpackEsmAssets} from '@enonic/webpack-esm-assets'
import {webpackServerSideJs} from '@enonic/webpack-server-side-js'
import {webpackStyleAssets} from '@enonic/webpack-style-assets'

const MODE = 'development';
// const MODE = 'production';

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
			new UglifyJsPlugin({
				parallel: true, // highly recommended
				sourceMap: false/*,
				uglifyOptions: {
					mangle: false, // default is true?
					keep_fnames: true // default is false?
				}*/
			})
		]
	},
	output: {
		//filename: '[name].js',
		filename: 'yase.js',
		library: 'yase',
		libraryTarget: 'umd',
		path: DST_ASSETS_DIR_ABS
	},
	performance: {
		hints: false
	},
	plugins: [
		new CopyWebpackPlugin([
			//{ from: 'babel-standalone/', to: 'babel-standalone/' },
			{ from: 'formik/dist/formik.umd*', to: 'formik/[name].[ext]' },
			{ from: 'jquery/dist', to: 'jquery'},
			{ from: 'react/umd/react.*.js', to: 'react/[name].[ext]' },
			{ from: 'react-dom/umd/react-dom.*.js', to: 'react-dom/[name].[ext]' },
			{ from: 'semantic-ui/dist', to: 'semantic-ui'}
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

const WEBPACK_CONFIG = [webpackServerSideJs({
	__dirname,
	externals: [
		// /\/lib\/cron/,
		/\/lib\/explorer\/(?!client)/,

		/\/lib\/http-client/,
		/\/lib\/router/,

		// /\/lib\/util.*$/,
		/\/lib\/util/,
		/\/lib\/util\/value/,

		// /\/lib\/xp.*$/
		/\/lib\/xp\/admin/,
		/\/lib\/xp\/auth/,
		/\/lib\/xp\/common/,
		/\/lib\/xp\/cluster/,
		/\/lib\/xp\/context/,
		/\/lib\/xp\/event/,
		/\/lib\/xp\/node/,
		/\/lib\/xp\/portal/,
		/\/lib\/xp\/repo/,
		/\/lib\/xp\/task/,
		/\/lib\/xp\/value/
	],
	serverSideFiles: [
		'src/main/resources/main',
		'src/main/resources/admin/tools/explorer/explorer'
	],
	mode: MODE,
	resolveAlias: {
		'/admin/tools/explorer': path.resolve(__dirname, 'src/main/resources/admin/tools/explorer/'),
		// '/lib/explorer/client': path.resolve(__dirname, '../lib-explorer-client/src/main/resources/lib/explorer/client/'),
		// '/lib/explorer': path.resolve(__dirname, '../lib-explorer/src/main/resources/lib/explorer/'),
		'/lib/cron': path.resolve(__dirname, '../lib-cron/src/main/resources/lib/cron/')
	}
}), webpackStyleAssets({
	__dirname,
	mode: MODE
}), CLIENT_JS_CONFIG, webpackEsmAssets({
	__dirname,
	assetFiles: [
		'src/main/resources/assets/react/Collection.jsx',
		'src/main/resources/assets/react/Interfaces.jsx'
	],
	mode: MODE
})];

//console.log(`WEBPACK_CONFIG:${JSON.stringify(WEBPACK_CONFIG, null, 4)}`);
//process.exit();

export { WEBPACK_CONFIG as default };
