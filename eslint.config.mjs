import {defineConfig, globalIgnores} from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';


export default defineConfig([
	globalIgnores([
		'build/**'
	]),
	{
		files: [
			'**/*.ts',
			'**/*.tsx'
		],
		extends: [
			tseslint.configs.recommended,
		],
		languageOptions: {
			globals: {
				...globals.es2020,

				// Node
				__dirname: 'readonly',
				process: 'readonly',
				require: 'readonly',

				// CommonJS (CJS) format
				exports: 'writable',
				module: 'writable',

				// Nashorn
				Java: 'readonly',

				// Enonic XP
				app: 'readonly',
				log: 'readonly',
				resolve: 'readonly',
				__: 'readonly',

				// Client-side js
				console: 'readonly',
				document: 'readonly',
				fetch: 'readonly',
				setTimeout: 'readonly',
				window: 'readonly',

				// Jquery
				$: 'readonly',
				jQuery: 'readonly',

				// React
				React: 'readonly',
			},
		},
		plugins: {
			'react-hooks': reactHooks,
		},
		rules: { // https://eslint.org/docs/rules
			'@typescript-eslint/ban-ts-comment': ['error', {
				'ts-expect-error': false, // 'allow-with-comment'
				'ts-ignore': false, // 'allow-with-comment'
				'ts-nocheck': true,
				'ts-check': true,
			}],
			'comma-dangle': ['error', {
				arrays: 'ignore',
				objects: 'only-multiline',
				imports: 'only-multiline',
				exports: 'only-multiline',
				functions: 'ignore'
			}],
			indent: ['warn', 4], // Keep in sync with .editorconfig
			'max-len': ['error', 160, 2, {
				ignoreUrls: true,
				ignoreComments: true,
				ignoreRegExpLiterals: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true
			}],
			'no-cond-assign': ['error', 'except-parens'],
			'no-console': 'off',
			'no-multi-spaces': ['off'],
			'no-tabs': ['off'],
			'no-underscore-dangle': ['error', {
				allow: [
					'__', // Enonic XP Java Bridge
					'__connection', // My own stupidity
					'_branchId', // fake node property
					'_collection', // fake node property
					'_createdTime', // fake node property
					'_documentType', // fake node property
					'_id', // content-type property
					'_indexConfig', // node property
					'_inheritsPermissions', // node property
					'_json', // fake node property
					'_modifiedTime', // fake node property
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
			'no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
			'@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
			'object-curly-spacing': ['off'],
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			semi: ['off'],
			'spaced-comment': ['off'],
			strict: 1
		} // rules
	},
]);
