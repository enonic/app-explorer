import { resolve } from 'path';
import { defineConfig } from 'tsdown';
import {
	copyWithHash,
	emitAssets,
	globals,
	manifest,
} from '../../tsdown/plugins.mts';


const BUILD_ROOT = resolve(import.meta.dirname, '../../build/resources/main');
const OUT_DIR = `${BUILD_ROOT}/services/explorerAssets/files`;

const sourcemap = process.env.NODE_ENV === 'development' ? false : true;

export default defineConfig({
	clean: false,
	deps: {
		alwaysBundle: () => true,
	},
	define: {
		global: 'globalThis',
	},
	dts: false, // d.ts files are use useless at runtime
	entry: {
		Explorer: resolve(import.meta.dirname, 'App.tsx'),
	},
	fixedExtension: true,
	format: 'esm',
	logLevel: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||'') ? 'silent' : undefined,
	minify: process.env.NODE_ENV === 'development' ? false : true,
	outDir: OUT_DIR,
	outputOptions: {
		assetFileNames: '[name]-[hash][extname]',
		entryFileNames: '[name]-[hash].mjs',
		// Client-side doesn't like import statements, without providing an importmap.
		inlineDynamicImports: true,
	},
	platform: 'browser',
	plugins: [
		globals({
			react: 'React',
			'react-dom': 'ReactDOM',
		}),
		emitAssets({
			'favicon.ico': resolve(import.meta.dirname, 'favicon.ico'),
			'styles.css': resolve(import.meta.dirname, 'style/main.sass'),
		}, { compress: process.env.NODE_ENV !== 'development' }),
		manifest({
			fileName: 'manifest.json',
			shortNames: true,
		}),
		copyWithHash({
			context: 'node_modules',
			manifest: 'node_modules_manifest.json',
			outDir: OUT_DIR,
			patterns: [
				'graphiql/graphiql.min.css',
				'nice-react-gantt/lib/css/style.css',
				'react/umd/*.js',
				'react-dom/umd/*.js',
				'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css',
				'semantic-ui-css/semantic*',
				'semantic-ui-css/themes',
				'semantic-ui-react/dist/es'
			],
			sourcemap,
		}),
	],
	sourcemap,
	tsconfig: 'tsconfig.assets.json',
});
