export default {
	collectCoverageFrom: [
		'src/main/resources/**/*.{ts,tsx}'
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
			name: 'com.enonic.app.explorer'
		},
	},

	// It seems mocks doesn't apply to mapped modules?
	moduleNameMapper: {
		'/lib/explorer/(.*)': '<rootDir>/symlinks/lib-explorer/src/main/resources/lib/explorer/$1'
	},

	preset: 'ts-jest/presets/js-with-babel-legacy',
	// preset: 'ts-jest/presets/js-with-babel',

	// testEnvironment: 'jsdom', // Doesn't change Uncovered Lines
	testEnvironment: 'node',

	testMatch: [
		'<rootDir>/test/**/*.(spec|test).{ts,tsx}'
	],

	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: 'test/tsconfig.json'
			}
		]
	},

	// transformIgnorePatterns: [
	// 	'/node_modules/(?!@sindresorhus/)',
	// 	// '/node_modules/(?!string-width/)'
	// ]
}
