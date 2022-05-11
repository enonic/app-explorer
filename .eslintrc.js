module.exports = {

	env: {
		/*browser - browser global variables.
		node - Node.js global variables and Node.js scoping.
		commonjs - CommonJS global variables and CommonJS scoping (use this for browser-only code that uses Browserify/WebPack).
		shared-node-browser - Globals common to both Node.js and Browser.
		es6 - enable all ECMAScript 6 features except for modules (this automatically sets the ecmaVersion parser option to 6).
		es2017 - adds all ECMAScript 2017 globals and automatically sets the ecmaVersion parser option to 8.*/
		es2020: true/*, // - adds all ECMAScript 2020 globals and automatically sets the ecmaVersion parser option to 11.
		worker - web workers global variables.
		amd - defines require() and define() as global variables as per the amd spec.
		mocha - adds all of the Mocha testing global variables.
		jasmine - adds all of the Jasmine testing global variables for version 1.3 and 2.0.
		jest - Jest global variables.
		phantomjs - PhantomJS global variables.
		protractor - Protractor global variables.
		qunit - QUnit global variables.
		jquery - jQuery global variables.
		prototypejs - Prototype.js global variables.
		shelljs - ShellJS global variables.
		meteor - Meteor global variables.
		mongo - MongoDB global variables.
		applescript - AppleScript global variables.
		nashorn - Java 8 Nashorn global variables.
		serviceworker - Service Worker global variables.
		atomtest - Atom test helper globals.
		embertest - Ember test helper globals.
		webextensions - WebExtensions globals.
		greasemonkey - GreaseMonkey globals.*/
	},

	// https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/style.js
	extends: [
		//'eslint:recommended',
		//'airbnb-base',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:jsx-a11y/recommended',
		'plugin:react-hooks/recommended'
	],

	globals: {
		// Node
		__dirname: false,
		process: false,
		require: false,

		// CommonJS (CJS) format
		exports: false,
		module: false,

		// Nashorn
		Java: false,

		// Enonic XP
		app: false,
		log: false,
		resolve: false,
		__: false,

		// Mocha
		//describe: false,
		//it: false,

		// Client-side js
		console: false,
		document: false,
		fetch: false,
		//global: false,
		//navigator: false,
		setTimeout: false,
		window: false,
		//XMLHttpRequest: false,

		// Jquery
		$: false,
		jQuery: false,

		// React
		React: false

	}, //globals

	//parser: 'espree', // default
	//parser: 'esprima',
	//parser: 'babel-eslint',

	/*parserOptions: {
		allowImportExportEverywhere: false,

		codeFrame: true,

		ecmaFeatures: {
			jsx: true
		},

		// set to 3, 5 (default), 6, 7, 8, 9, 10 or 11 to specify the version of ECMAScript syntax you want to use.
		// You can also set to 2015 (same as 6), 2016 (same as 7), 2017 (same as 8), 2018 (same as 9), 2019 (same as 10) or 2020 (same as 11) to use the year-based naming.
		//ecmaVersion: 2020, // 11
		ecmaVersion: 6, // 2015

		impliedStrict: true,

		// set to "script" (default) or "module" if your code is in ECMAScript modules.
		sourceType: 'module' // allow import statements
	},*/

	overrides: [{
		files: [
			//'**/*.es', // Currently no such files
			//'**/*.es6', // Currently no such files
			//'**/*.js', // Currently no such files
			//'**/*.jsx', // Currently no such files
			//'**/*.mjs', // Currently no such files
			'**/*.ts',
			'**/*.tsx'
		]
	}],

	plugins: [
		///'import',
		//'react',
		'jsx-a11y',
		'@typescript-eslint'
	],

	root: true,

	rules: { // https://eslint.org/docs/rules
		'@typescript-eslint/ban-ts-comment': ['error', {
			'ts-expect-error': false, // 'allow-with-comment'
			'ts-ignore': false, // 'allow-with-comment'
			'ts-nocheck': true,
			'ts-check': true,
		}],
		'comma-dangle': ['error', {
			// never (default) disallows trailing commas
			// always requires trailing commas
			// always-multiline requires trailing commas when the last element
			//  or property is in a different line than the closing ] or } and
			//  disallows trailing commas when the last element or property is
			//  on the same line as the closing ] or }
			// only-multiline allows (but does not require) trailing commas when
			//  the last element or property is in a different line than the
			//  closing ] or } and disallows trailing commas when the last
			//  element or property is on the same line as the closing ] or }
			// ignore who cares? no body
			arrays: 'ignore',
			objects: 'only-multiline',
			imports: 'never',
			exports: 'never',
			functions: 'ignore'
		}],
		'import/extensions': ['off'],
		'import/prefer-default-export': ['off'],
		'import/no-absolute-path': ['off'],
		'import/no-extraneous-dependencies': ['off'],
		'import/no-unresolved': ['off'],
		indent: ['warn', 'tab'],
		'max-len': ['error', 160, 2, {
			ignoreUrls: true,
			ignoreComments: true,
			ignoreRegExpLiterals: true,
			ignoreStrings: true,
			ignoreTemplateLiterals: true
		}],
		'no-cond-assign': ['error', 'except-parens'],
		'no-multi-spaces': ['off'],
		'no-tabs': ['off'],
		'no-underscore-dangle': ['error', {
			allow: [
				'__', // Enonic XP Java Bridge
				'__connection', // My own stupidity
				'_id', // content-type property
				'_branchId', // fake node property
				'_indexConfig', // node property
				'_inheritsPermissions', // node property
				'_name', // node property
				'_nodeType', // node property
				'_parentPath', // node property
				'_path', // content-type property
				'_permissions', // node property
				'_repoId', // fake node property
				'_score', // fake node property
				'_selected', // option-set property
				'_ts', // node property
				'_versionKey' // node property
			],
			allowAfterThis: true,
			allowAfterSuper: false,
			enforceInMethodNames: false
		}],
		'no-unexpected-multiline': 'off',
		'object-curly-spacing': ['off'],
		'react/jsx-no-undef': [
			'error',
			{
				allowGlobals: true
			}
		],
		//'react/jsx-uses-react': 'error',
		//'react/jsx-uses-vars': 'error',
		'react/prop-types': 'off',
		'react/react-in-jsx-scope': 'off', // Since React is a global
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		semi: [
			'off',
			// "always" (default) requires semicolons at the end of statements
			// "never" disallows semicolons as the end of statements (except to
			//         disambiguate statements beginning with [, (, /, +, or -)
			'always',
			{
				// when "always"
				omitLastInOneLineBlock: true

				// when "never"
				// "any" (default) ignores semicolons (or lacking semicolon) at
				//       the end of statements if the next line starts with
				//       [, (, /, +, or -.
				// "always" requires semicolons at the end of statements if the
				//          next line starts with [, (, /, +, or -.
				// "never" disallows semicolons as the end of statements if it
				//         doesn't make ASI hazard even if the next line starts
				//         with [, (, /, +, or -.
				//beforeStatementContinuationChars: 'never'
			}
		],
		'spaced-comment': ['off'],
		strict: 1
	} // rules

}; // module.exports
