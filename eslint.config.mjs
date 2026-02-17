import { defineConfig, globalIgnores } from 'eslint/config';

import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

import pluginPrettier from 'eslint-plugin-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';

export default defineConfig([
	...nextVitals,
	...nextTs,

	globalIgnores([
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
		'node_modules',
		'dist',
		'public',
		'.cache',
		'eslint.config.mjs',
		'postcss.config.js',
		'stylelint.config.mjs',
		'prettier.config.*',
		'commitlint.config.*',
		'lint-staged.config.*',
		'*.config.{js,cjs,mjs,ts}',
		'scripts/**',
	]),

	{
		files: ['**/*.{js,ts,jsx,tsx}'],
		plugins: {
			'prettier': pluginPrettier,
			'simple-import-sort': pluginSimpleImportSort,
			sonarjs,
			'unicorn': unicornPlugin,
		},
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: 'module',
		},
		rules: {
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						['^\\u0000'],
						['^react$', '^react-dom$', '^next', '^@?\\w'],
						['^@/', '^@.+/'],
						['^[./]'],
						['^.+\\.s?css$'],
					],
				},
			],
			'simple-import-sort/exports': 'error',
			'import/order': 'off',
			'import/newline-after-import': ['error', { count: 1 }],

			'padding-line-between-statements': [
				'error',
				{ blankLine: 'always', prev: '*', next: 'return' },
				{ blankLine: 'always', prev: 'block-like', next: 'export' },
			],

			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

			'prettier/prettier': 'error',
			'eqeqeq': ['error', 'always'],
			'consistent-return': 'error',
			'no-console': ['error', { allow: ['warn', 'error'] }],

			'jsx-a11y/anchor-is-valid': 'warn',
			'jsx-a11y/click-events-have-key-events': 'warn',
			'jsx-a11y/no-static-element-interactions': 'warn',

			'unicorn/prefer-includes': 'error',
			'unicorn/prefer-string-starts-ends-with': 'error',
			'unicorn/prefer-optional-catch-binding': 'error',
			'unicorn/no-null': 'off',
			'unicorn/prefer-logical-operator-over-ternary': 'warn',
			'unicorn/no-useless-undefined': 'error',
			'unicorn/filename-case': 'off',
			'unicorn/prefer-single-call': 'warn',
			'unicorn/no-unnecessary-slice-end': 'warn',

			'sonarjs/no-identical-conditions': 'error',
			'sonarjs/no-extra-arguments': 'error',
			'sonarjs/non-existent-operator': 'error',
			'sonarjs/no-identical-expressions': 'error',
			'sonarjs/no-duplicated-branches': 'error',
			'sonarjs/no-useless-catch': 'error',
			'sonarjs/no-redundant-jump': 'error',
			'sonarjs/cognitive-complexity': ['warn', 18],
			'sonarjs/no-collapsible-if': 'warn',
			'sonarjs/prefer-single-boolean-return': 'warn',
			'sonarjs/prefer-immediate-return': 'warn',

			'no-shadow': 'off',
			'@typescript-eslint/no-shadow': 'error',
			'no-magic-numbers': [
				'warn',
				{
					ignore: [0, 1],
					ignoreArrayIndexes: true,
					enforceConst: true,
					ignoreDefaultValues: true,
					ignoreEnums: true,
				},
			],
			'prefer-arrow-callback': 'error',
			'prefer-destructuring': ['error', { object: true, array: false }],
			'object-shorthand': ['error', 'always'],
		},
	},
	{
		files: ['src/widgets/**/*.{js,ts,jsx,tsx}'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@/app', '@/app/**'],
							message: 'Layer rule: widgets cannot import app.',
						},
					],
				},
			],
		},
	},
	{
		files: ['src/features/**/*.{js,ts,jsx,tsx}'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@/app', '@/app/**'],
							message: 'Layer rule: features cannot import app.',
						},
						{
							group: ['@/widgets', '@/widgets/**', '@widgets', '@widgets/**'],
							message: 'Layer rule: features cannot import widgets.',
						},
					],
				},
			],
		},
	},
	{
		files: ['src/entities/**/*.{js,ts,jsx,tsx}'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@/app', '@/app/**'],
							message: 'Layer rule: entities cannot import app.',
						},
						{
							group: ['@/widgets', '@/widgets/**', '@widgets', '@widgets/**'],
							message: 'Layer rule: entities cannot import widgets.',
						},
						{
							group: ['@/features', '@/features/**', '@features', '@features/**'],
							message: 'Layer rule: entities cannot import features.',
						},
					],
				},
			],
		},
	},
	{
		files: ['src/shared/**/*.{js,ts,jsx,tsx}'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['@/app', '@/app/**'],
							message: 'Layer rule: shared cannot import app.',
						},
						{
							group: ['@/widgets', '@/widgets/**', '@widgets', '@widgets/**'],
							message: 'Layer rule: shared cannot import widgets.',
						},
						{
							group: ['@/features', '@/features/**', '@features', '@features/**'],
							message: 'Layer rule: shared cannot import features.',
						},
						{
							group: ['@/entities', '@/entities/**', '@entities', '@entities/**'],
							message: 'Layer rule: shared cannot import entities.',
						},
					],
				},
			],
		},
	},

	prettierConfig,
]);
