export const APP_NAME = 'com.enonic.app.explorer';
export const EXPLORER_VERSION = '4.4.4';

const DIR_SRC = 'src/main/resources';
const AND_BELOW = '**';
const SOURCE_FILES = `*.{ts,tsx}`;
const DECLARATION_FILES = `*.d.{ts,tsx}`;
const TEST_EXT = `{spec,test}.{ts,tsx}`;
const TEST_FILES = `*.${TEST_EXT}`;


export default {
	collectCoverageFrom: [
		`${DIR_SRC}/${AND_BELOW}/${SOURCE_FILES}`,
		`!${DIR_SRC}/${AND_BELOW}/${DECLARATION_FILES}`
	],

	coveragePathIgnorePatterns: [
		'/bin/',
		'/node_modules/',
		'/test/',
	],

	// In order for tests to work on all files, we have to use v8 coverage provider.
	coverageProvider: 'v8', // Changes Uncovered Lines

	globals: {
		app: {
			config: {},
			name: APP_NAME,
			version: EXPLORER_VERSION
		},
	},

	// It seems mocks doesn't apply to mapped modules?
	moduleNameMapper: {
		// '@enonic/mock-xp/(.*)': '<rootDir>/symlinks/enonic-mock-xp/$1',
		// '@enonic/js-utils/(.*)': '<rootDir>/symlinks/enonic-js-utils/$1',

		// There is no @enonic-types/lib-explorer yet, so these are workarounds
		'@enonic-types/lib-explorer': '<rootDir>/symlinks/lib-explorer/src/main/resources/lib/explorer/types/index.d',
		'@enonic-types/lib-explorer/(.*)': '<rootDir>/symlinks/lib-explorer/src/main/resources/lib/explorer/types/$1',

		'/lib/explorer/(.*)': '<rootDir>/symlinks/lib-explorer/src/main/resources/lib/explorer/$1',
	},

	preset: 'ts-jest/presets/js-with-babel-legacy',
	// preset: 'ts-jest/presets/js-with-babel',

	// A list of paths to modules that run some code to configure or set up the
	// testing environment. Each setupFile will be run once per test file. Since
	// every test runs in its own environment, these scripts will be executed in
	// the testing environment before executing setupFilesAfterEnv and before
	// the test code itself.
	setupFiles: [
		'<rootDir>/test/setupFile.ts'
	],

	// testEnvironment: 'jsdom', // Doesn't change Uncovered Lines
	testEnvironment: 'node',

	testMatch: [
		`<rootDir>/${DIR_SRC}/${AND_BELOW}/${TEST_FILES}`,
		`<rootDir>/test/${AND_BELOW}/${TEST_FILES}`
	],

	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: 'test/tsconfig.json'
			}
		]
	},

	transformIgnorePatterns: [
		'/node_modules/(?!@enonic/(js-utils|mock-xp))',
	]
}
