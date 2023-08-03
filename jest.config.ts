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
			name: 'com.enonic.app.explorer',
			version: '2.0.0'
		},
		// Didn't work when running more than one test
		// Java: {
		// 	type: (path: string) => {
		// 		if (path === 'java.util.Locale') {
		// 			return {
		// 				forLanguageTag: (locale: string) => locale
		// 			}
		// 		} else if (path === 'java.lang.System') {
		// 			return {
		// 				currentTimeMillis: () => 0
		// 			};
		// 		} else {
		// 			throw new Error(`Unmocked Java.type path: '${path}'`);
		// 		}
		// 	}
		// }
	},

	// It seems mocks doesn't apply to mapped modules?
	moduleNameMapper: {
		// '@enonic/mock-xp/(.*)': '<rootDir>/symlinks/enonic-mock-xp/$1',
		// '@enonic/js-utils/(.*)': '<rootDir>/symlinks/enonic-js-utils/$1',
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

	transformIgnorePatterns: [
		'/node_modules/(?!@enonic/mock-xp/src)',
	]
}
