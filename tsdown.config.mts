import { transform } from '@swc/core';
import { globSync } from 'glob';
import { resolve } from 'path';
import { defineConfig } from 'tsdown';


const DIR_SRC = 'src/main/resources';
const AND_BELOW = '**';
const TEST_EXT = `{spec,test}.{ts,tsx}`;
const TEST_FILES = `*.${TEST_EXT}`;
const ASSETS_PATH = `${DIR_SRC}/assets`;

const DECLARATION_FILES = globSync(`${DIR_SRC}/${AND_BELOW}/*.d.ts`);

const ASSET_FILES = globSync(`${ASSETS_PATH}/${AND_BELOW}/*.*`);

const SERVER_FILES = globSync(
	`${DIR_SRC}/${AND_BELOW}/*.ts`,
	{
		absolute: false,
		ignore: DECLARATION_FILES.concat(
			ASSET_FILES,
			globSync(`${DIR_SRC}/${AND_BELOW}/${TEST_FILES}`)
		),
	}
);

const BUNDLED_PACKAGES = [
	// To check if you have forgotten any try this command
	// clear && npm run clean && npm run build:tsdown && grep -r 'require(' build/resources/main|grep -v '("\.'|grep -v '("\/'

	// TODO: These might need Polyfills for global to run in Nashorn:
	// '@enonic/explorer-utils', //
	// '@enonic/fnv-plus', //
	'@enonic/js-utils', // many places
	// 'array.prototype.find', // tasks/webcrawl/webcrawl
	'cheerio', //
	'gql-query-builder', //
	'core-js', //
	'fast-deep-equal', //
	'human-object-diff', //
	// 'is-generator-function', // my_node_modules/util
	'object.getownpropertydescriptors', // tasks/webcrawl/webcrawl
	'robots-txt-guard', //
	'uri-js', //

	// Without it TypeError: null is not a function
	// 'util', // node_modules/object-inspect/util.inspect.js
];


export default defineConfig({
	alias: {
		util: resolve(import.meta.dirname, 'node_modules/@jspm/core/nodelibs/browser/util.js'),
	},
	entry: SERVER_FILES,
	root: DIR_SRC,
	outDir: 'build/resources/main',
	cjsDefault: false,
	clean: false,
	deps: {
		neverBundle: [ // All these are available runtime in the jar file:
			'/lib/cache',
			'/lib/enonic/asset',
			'/lib/enonic/static',
			/^\/lib\/explorer/,
			'/lib/galimatias',
			'/lib/graphql',
			'/lib/graphql-connection',
			'/lib/http-client',
			'/lib/license',
			'/lib/router',
			'/lib/vanilla',
			'/lib/text-encoding',
			'/lib/thymeleaf',
			'/lib/xp/admin',
			'/lib/xp/app',
			'/lib/xp/auditlog',
			'/lib/xp/auth',
			'/lib/xp/cluster',
			'/lib/xp/common',
			'/lib/xp/content',
			'/lib/xp/context',
			'/lib/xp/event',
			'/lib/xp/export',
			'/lib/xp/grid',
			'/lib/xp/i18n',
			'/lib/xp/io',
			'/lib/xp/mail',
			'/lib/xp/node',
			'/lib/xp/portal',
			'/lib/xp/project',
			'/lib/xp/repo',
			'/lib/xp/scheduler',
			'/lib/xp/schema',
			'/lib/xp/task',
			'/lib/xp/value',
			'/lib/xp/vhost',
			'/lib/xp/websocket',
		],
		alwaysBundle: (id) => BUNDLED_PACKAGES.some((name) => id === name || id.startsWith(`${name}/`)),
	},
	dts: false,
	fixedExtension: false,
	format: 'cjs',
	inputOptions: {
		platform: 'neutral',
		resolve: { mainFields: ['main', 'module'] },
	},
	minify: false, // Minifying server files makes debugging harder
	outputOptions: {
		chunkFileNames: '_chunks/[name]-[hash].js',
		intro: `const globalThis = (1, eval)('this');`,
		esModule: true,
		generatedCode: { symbols: false },
	},
	platform: 'neutral',
	plugins: [{
		name: 'inject-polyfills',
		transform(code, id) {
			// This works, but might not be needed, because I'm using arrayIncludes from @enonic/js-utils
			if (this.getModuleInfo(id)?.isEntry) {
				return { code: `import 'core-js/stable/array/includes';\n${code}`, map: null };
			}
		},
	}, {
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
