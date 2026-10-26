import { transform } from '@swc/core';
import { resolve } from 'path';
import { defineConfig } from 'tsdown';

const outDir = resolve(import.meta.dirname,'../../../build/resources/main/tasks/webcrawl');

export default defineConfig({
	alias: {
		util: resolve(import.meta.dirname, '../../../node_modules/@jspm/core/nodelibs/browser/util.js'),
	},
	entry: {
		webcrawl: resolve(import.meta.dirname, 'webcrawl.ts'),
	},
	cjsDefault: false,
	clean: false,
	copy: resolve(import.meta.dirname, 'publicDir/*'), // Copies the task descriptor :)
	deps: {
		neverBundle: [ // All these are available runtime in the jar file:
			/^\/lib\/explorer/,
			'/lib/http-client',
			/^\/lib\/xp/,
		],
		alwaysBundle: (id) => [
			'@enonic/js-utils',
			'cheerio',
			'core-js',
			'object.getownpropertydescriptors',
			'robots-txt-guard',
			'uri-js',
		].some((name) => id === name || id.startsWith(`${name}/`)),
	},
	dts: false,
	fixedExtension: false,
	format: 'cjs',
	inputOptions: {
		platform: 'neutral',
		resolve: { mainFields: ['main', 'module'] },
	},
	minify: false, // Minifying server files makes debugging harder
	outDir,
	outputOptions: {
		chunkFileNames: '_chunks/[name]-[hash].js',
		intro: `const globalThis = (1, eval)('this');`,
		esModule: true,
		generatedCode: { symbols: false },
	},
	platform: 'neutral',
	plugins: [{
		name: 'swc-es5',
		async renderChunk(code, chunk) {
			const result = await transform(code, {
				filename: chunk.fileName,
				sourceMaps: false,
				jsc: {
					target: 'es5',
					parser: { syntax: 'ecmascript' },
				},
				module: { type: 'commonjs' },
			});
			return { code: result.code, map: null };
		},
	}],
	shims: false,
	sourcemap: false,
	target: 'es2020',
	tsconfig: 'tsconfig.tsdown.json',
});
