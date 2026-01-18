import copyWithHashPlugin from '@enonic/esbuild-plugin-copy-with-hash';
import GlobalsPlugin from 'esbuild-plugin-globals';
import manifestPlugin from 'esbuild-plugin-manifest';
import { sassPlugin } from 'esbuild-sass-plugin';
import { resolve } from 'path';
import { defineConfig } from 'tsup';


const BUILD_ROOT = 'build/resources/main';
const OUT_DIR = `${BUILD_ROOT}/services/explorerAssets/files`;


export default defineConfig(() => {
	return {

		// Needed to bundle
		// * react/jsx-runtime
		// * @seamusleahy/init-hooks
		// * react-router-dom
		// * ./*.tsx
		bundle: true,

		dts: false, // d.ts files are use useless at runtime
		entry: {
			Explorer: resolve(__dirname, 'App.tsx'),
			favicon: resolve(__dirname, 'favicon.ico'),
			styles: resolve(__dirname, 'style/main.sass'),
		},
		esbuildPlugins: [
			GlobalsPlugin({
				react: 'React',
				'react-dom': 'ReactDOM',
			}),
			sassPlugin(),
			manifestPlugin({
				shortNames: true
			}),
			copyWithHashPlugin({
				context: 'node_modules',

				// Turning this off doesn't work! :(
				// addHashesToFileNames: false, // Default is true

				manifest: 'node_modules_manifest.json',
				patterns: [
					'graphiql/dist/graphiql.css',
					'nice-react-gantt/lib/css/style.css',
					'react/umd/*.js',
					'react-dom/umd/*.js',
					'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css',
					'semantic-ui-css/semantic*',
					'semantic-ui-css/themes',
					'semantic-ui-react/dist/es'
				]
			})
		],
		external: [
			// 'react', // ERROR: For GlobalsPlugin to work react must NOT be listed here
			// 'react-dom', // ERROR: For GlobalsPlugin to work react must NOT be listed here
		],

		// NOTE If cjs is added you need to switch from
		// esbuild-plugin-manifest to @enonic/tsup-plugin-manifest.
		format: [
			// 'iife'
			'esm'
		],

		loader: {
			'.ico': 'copy',
		},
		minify: process.env.NODE_ENV === 'development' ? false : true,
   		noExternal: [
			/^@enonic\/js-utils/,
			'@enonic/semantic-ui-react-form',
			'@seamusleahy/init-hooks',
			'@semantic-ui-react/component-ref',
			'classnames',
			'cron-parser',
			'fast-deep-equal',
			'gql-query-builder-ts',
			'graphql-hooks',
			'jsuri',
			'lodash',
			'moment',
			'ms',
			'nice-react-gantt',
			'object-hash',
			'react', // WARNING: For GlobalsPlugin to work react MUST be listed here (if react under dependencies or peerDependencies),
			'react-dnd',
			'react-dnd-html5-backend',
			'react-dom', // WARNING: For GlobalsPlugin to work react MUST be listed here (if react-dom under dependencies or peerDependencies)
			'react-html-parser',
			'react-json-view',
			'react-router-dom',
			'react-semantic-ui-datepickers',
			'react-semantic-ui-range',
			'semantic-ui-react',
			'traverse',
			'use-debounce',
		],
		outDir: OUT_DIR,
    	platform: 'browser',
		silent: ['QUIET', 'WARN']
			.includes(process.env.LOG_LEVEL_FROM_GRADLE||''),

		// Client-side doesn't like import statements, without providing an importmap.
		splitting: false,
		// splitting: true,

		sourcemap: process.env.NODE_ENV === 'development' ? false : true,
	    tsconfig: 'tsconfig.assets.json'
	};
});
