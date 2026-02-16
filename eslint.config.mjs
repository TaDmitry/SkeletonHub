import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, globalIgnores } from 'eslint/config';

import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

import tsParser from '@typescript-eslint/parser';

import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
			'@typescript-eslint': tsPlugin,
			'import': importPlugin,
			'prettier': pluginPrettier,
			'simple-import-sort': pluginSimpleImportSort,
			sonarjs,
			'unicorn': unicornPlugin,
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
				ecmaVersion: 2024,
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
			ecmaVersion: 2024,
			sourceType: 'module',
		},
		settings: {
			'react': { version: 'detect' },
			'import/resolver': { node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] } },
		},
		rules: {
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
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

			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'error',

			'prettier/prettier': 'error',
			'no-var': 'error',
			'prefer-const': 'error',
			'eqeqeq': ['error', 'always'],
			'consistent-return': 'error',
			'no-console': ['error', { allow: ['warn', 'error'] }],

			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',

			'jsx-a11y/anchor-is-valid': 'warn',
			'jsx-a11y/alt-text': 'warn',
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

	prettierConfig,
]);
