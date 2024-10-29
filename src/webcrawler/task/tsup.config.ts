import { polyfillNode } from 'esbuild-plugin-polyfill-node';
import { resolve } from 'path';
import { defineConfig } from 'tsup';

const outDir = resolve(__dirname,'../../../build/resources/main/tasks/webcrawl');

export default defineConfig(() => {
	return {
		entry: {
			webcrawl: resolve(__dirname, 'webcrawl.ts'),
		},
		esbuildPlugins: [
			polyfillNode({
				globals: {
					buffer: false,
					process: false
				},
				polyfills: {
					_stream_duplex: false,
					_stream_passthrough: false,
					_stream_readable: false,
					_stream_transform: false,
					_stream_writable: false,
					assert: false,
					'assert/strict': false,
					async_hooks: false,
					buffer: false,
					child_process: false,
					cluster: false,
					console: false,
					constants: false,
					crypto: false,
					dgram: false,
					diagnostics_channel: false,
					dns: false,
					domain: false,
					events: false,
					fs: false,
					'fs/promises': false,
					http: false,
					http2: false,
					https: false,
					module: false,
					net: false,
					os: false,
					path: false,
					perf_hooks: false,
					process: "empty",
					punycode: false,
					querystring: false,
					readline: false,
					repl: false,
					stream: false,
					string_decoder: false,
					sys: false,
					timers: false,
					'timers/promises': false,
					tls: false,
					tty: false,
					url: false,
					util: true,
					v8: false,
					vm: false,
					wasi: false,
					worker_threads: false,
					zlib: false,
				}
			}) // ReferenceError: "navigator" is not defined
		],
		esbuildOptions(options/*, context*/) {
			// options.alias = {
			// 	'util': './src/main/resources/my_node_modules/util/util.js'
			// };
			options.banner = {
				js: `const globalThis = (1, eval)('this');`
			};
			options.chunkNames = '_chunks/[name]-[hash]';
			// options.target = 'es2020'; // tsup does this for us :)
		// 	options.tsconfig = 'tsconfig.tsup.json'
		},
		external: [ // All these are available runtime in the jar file:
			/^\/lib\/explorer/,
			'/lib/http-client',
			/^\/lib\/xp/,
		],
		format: 'cjs',
		minify: false, // Minifying server files makes debugging harder
		publicDir: resolve(__dirname, 'publicDir'), // Copies xml file :)
		noExternal: [
			/^@enonic\/js-utils/,
			'cheerio',
			'core-js',
			'object.getownpropertydescriptors',
			'robots-txt-guard',
			'uri-js',
		],
		outDir,
		platform: 'neutral',
		shims: false,
		splitting: true,
		sourcemap: false,
		target: 'es5', // Important or shorthand properties wont be converted!
		// tsconfig: '../../../tsconfig.tsup.json'
	};
});
