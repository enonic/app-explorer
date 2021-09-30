module.exports = {

	// https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/style.js
	extends: [
		'eslint:recommended',
		//'airbnb-base',
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
	parser: 'babel-eslint',

	parserOptions: {
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
	},

	plugins: [
		'import',
		'react',
		'jsx-a11y'
	],

	rules: { // https://eslint.org/docs/rules
		'comma-dangle': ['error', {
			arrays: 'ignore',
			objects: 'never',
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
				'_versionKey' // node property
			],
			allowAfterThis: false,
			allowAfterSuper: false,
			enforceInMethodNames: false
		}],
		'no-unexpected-multiline': 'off',
		'object-curly-spacing': ['off'],
		"react/jsx-no-undef": ['error', { "allowGlobals": true }],
		//'react/jsx-uses-react': 'error',
		//'react/jsx-uses-vars': 'error',
		'react/prop-types': 'off',
		'react/react-in-jsx-scope': 'off', // Since React is a global
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		semi: 'error',
		'spaced-comment': ['off'],
		strict: 1
	} // rules

}; // module.exports
