import type { Options } from '.';


import CopyWithHashPlugin from '@enonic/esbuild-plugin-copy-with-hash';
import GlobalsPlugin from 'esbuild-plugin-globals';
import EnonicManifestTsupPlugin from '@enonic/tsup-plugin-manifest';
import { globSync } from 'glob';
import {
	DIR_DST,
	DIR_SRC_STATIC
} from './constants';


export default function buildStaticConfig(): Options {
	const DIR_DST_STATIC = `${DIR_DST}/static`;
	const GLOB_EXTENSIONS_STATIC = '{tsx,ts,jsx,js}';
	const FILES_STATIC = globSync(`${DIR_SRC_STATIC}/**/*.${GLOB_EXTENSIONS_STATIC}`);

	const entry = {};
	for (const element of FILES_STATIC) {
		entry[element
			.replace(`${DIR_SRC_STATIC}/`, '') // Remove path
			.replace(/\.[^.]+$/, '') // Remove extension
		] = element;
	}

	return {
		bundle: true,
		dts: false, // d.ts files are use useless at runtime
		entry,
		esbuildPlugins: [
			CopyWithHashPlugin({
				context: 'node_modules',
				manifest: `node_modules-manifest.json`,
				patterns: [
					'graphiql/graphiql.min.css',
					'react/{cjs,umd}/*.js',
					'react-dom/{cjs,umd}/*.js',
					'semantic-ui-css/*.css',
					'semantic-ui-css/themes/**/*',
					'semantic-ui-react/dist/**/*',
				]
			}),
			GlobalsPlugin({
				react: 'React',
				'react-dom': 'ReactDOM',
			}),
			EnonicManifestTsupPlugin({
				generate: (entries) => {// Executed once per format
					// print(entries, { maxItems: Infinity });
					const newEntries = {}
					Object.entries(entries).forEach(([k,v]) => {
						const ext = v.split('.').pop() as string;
						const parts = k.replace(`${DIR_SRC_STATIC}/`, '').split('.');
						parts.pop();
						parts.push(ext);
						newEntries[parts.join('.')] = v.replace(`${DIR_DST_STATIC}/`, '');
					});
					return newEntries;
				}
			}),
		],
		// By default tsup bundles all imported modules, but dependencies
		// and peerDependencies in your packages.json are always excluded
		external: [ // Must be loaded into global scope instead
			// 'react' // ERROR: For GlobalsPlugin to work react must NOT be listed here
			// 'react-dom'
		],

		format: [
			'cjs', // Legacy browser support, also css in manifest.json
			'esm', // For some reason doesn't report css files in manifest.json
		],
		minify: process.env['NODE_ENV'] === 'development' ? false : true,
		noExternal: [
			// '@enonic/js-utils', // Not in use yet.
			'@monaco-editor/react',
			'react', // WARNING: For GlobalsPlugin to work react MUST be listed here (if react under dependencies or peerDependencies)
			'react-dom',
			'react-json-view',
			'semantic-ui-react',
			'tiny-jsonc'
		],
		platform: 'browser',
		silent: ['QUIET', 'WARN'].includes(process.env['LOG_LEVEL_FROM_GRADLE']||''),

		// splitting: true, // TODO Uncaught SyntaxError: Cannot use import statement outside a module
		splitting: false,

		sourcemap: process.env['NODE_ENV'] === 'development' ? false : true,
	}
}
