import { globSync } from 'glob';
import { resolve } from 'path';
import { defineConfig } from 'tsdown';
import {
	DIR_DST,
	DIR_SRC_STATIC
} from './constants.mts';
import {
	copyWithHash,
	globals,
	manifest,
} from './plugins.mts';


const DIR_DST_STATIC = `${DIR_DST}/static`;
const GLOB_EXTENSIONS_STATIC = '{tsx,ts,jsx,js}';
const FILES_STATIC = globSync(`${DIR_SRC_STATIC}/**/*.${GLOB_EXTENSIONS_STATIC}`);

const sourcemap = process.env['NODE_ENV'] === 'development' ? false : true;

export default defineConfig(FILES_STATIC.map((element, i) => ({
	clean: false,
	deps: {
		alwaysBundle: () => true,
	},
	define: {
		global: 'globalThis',
	},
	dts: false, // d.ts files are use useless at runtime
	entry: {
		[element
			.replace(`${DIR_SRC_STATIC}/`, '') // Remove path
			.replace(/\.[^.]+$/, '') // Remove extension
		]: resolve(element),
	},
	fixedExtension: true,
	format: 'esm',
	logLevel: ['QUIET', 'WARN'].includes(process.env['LOG_LEVEL_FROM_GRADLE']||'') ? 'silent' : undefined,
	minify: process.env['NODE_ENV'] === 'development' ? false : true,
	outDir: DIR_DST_STATIC,
	outputOptions: {
		entryFileNames: '[name]-[hash].mjs',
		inlineDynamicImports: true,
	},
	platform: 'browser',
	plugins: [
		globals({
			react: 'React',
			'react-dom': 'ReactDOM',
		}),
		manifest({
			fileName: 'manifest.esm.json',
		}),
		i === 0 && copyWithHash({
			context: 'node_modules',
			manifest: `node_modules-manifest.json`,
			outDir: DIR_DST_STATIC,
			patterns: [
				'graphiql/graphiql.min.css',
				'react/{cjs,umd}/*.js',
				'react-dom/{cjs,umd}/*.js',
				'semantic-ui-css/*.css',
				'semantic-ui-css/themes/**/*',
				'semantic-ui-react/dist/**/*',
			],
			sourcemap,
		}),
	],
	sourcemap,
	tsconfig: 'tsconfig.static.json',
})));
