import { globSync } from 'glob';
// import { print } from 'q-i';
import { defineConfig, type Options } from 'tsup';


interface MyOptions extends Options {
	d?: string
}


const RESOURCES_PATH = 'src/main/resources';
const ASSETS_PATH = `${RESOURCES_PATH}/assets`;
// const CLIENT_GLOB_EXTENSIONS = '{tsx,ts,jsx,js}';


const SERVER_FILES = globSync(
	`${RESOURCES_PATH}/**/*.ts`,
	{
		absolute: false,
		ignore: [].concat(
			globSync(`${RESOURCES_PATH}/**/*.d.ts`),
			globSync(`${ASSETS_PATH}/**/*.*`),
		),
	}
);
// print(SERVER_FILES, { maxItems: Infinity });


export default defineConfig((options: MyOptions) => {
	// print(options, { maxItems: Infinity });
	if (options.d === 'build/resources/main') {
		return {
			entry: SERVER_FILES,
			external: [ // All these are available runtime in the jar file:
				'/lib/cache',
				/^\/lib\/explorer/,
				'/lib/galimatias',
				'/lib/graphql',
				'/lib/graphql-connection',
				/^\/lib\/guillotine/,
				'/lib/http-client',
				'/lib/license',
				'/lib/router',
				'/lib/util',
				'/lib/vanilla',
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
			format: 'cjs',
			'main-fields': 'main,module',
			minify: false, // Minifying server files makes debugging harder
			noExternal: [
				// To check if you have forgotten any try this command
				// clear && yarn clean && yarn build:tsup && grep -r 'require(' build/resources/main|grep -v '("\.'|grep -v '("\/'

				// TODO: These might need Polyfills for global to run in Nashorn:
				// '@enonic/explorer-utils', //
				// '@enonic/fnv-plus', //
				/^@enonic\/js-utils/, // many places
				'cheerio', //
				'gql-query-builder', //
				'core-js', //
				// 'd3-dsv', //
				'deep-object-diff', //
				// 'diff', //
				'fast-deep-equal', //
				'human-object-diff', //
				'polyfill-crypto.getrandomvalues', //
				'reflect-metadata', //
				'robots-txt-guard', //
				'serialize-javascript', //
				// 'traverse', //
				'uri-js', //
			],
			platform: 'neutral',

			// https://tsup.egoist.dev/#code-splitting
			// Code splitting currently only works with the esm output format,
			// and it's enabled by default.
			// If you want code splitting for cjs output format as well, try
			// using --splitting flag which is an experimental feature to get
			// rid of the limitation in esbuild.
			// splitting: true,

			shims: false, // https://tsup.egoist.dev/#inject-cjs-and-esm-shims
			sourcemap: false,
			target: 'es5'
		};
	}
	throw new Error(`Unconfigured directory:${options.d}!`)
})
