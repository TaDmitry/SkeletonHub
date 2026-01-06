import { dirname } from 'path';
import { fileURLToPath } from 'url';
import tsParser from '@typescript-eslint/parser';

// плагины (импортируем как объекты — безопаснее для flat-конфига)
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginA11y from 'eslint-plugin-jsx-a11y';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginImport from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
	// игнорируем папки/файлы
	{
		ignores: [
			'node_modules',
			'.next',
			'dist',
			'out',
			'public',
			'.cache',
			'eslint.config.mjs',
			'next-env.d.ts',
			'postcss.config.js',
		],
	},

	// главный блок — все js/ts файлы
	{
		files: ['**/*.{js,ts,jsx,tsx}'],

		// плагины подключаем как объекты (без использования `extends: 'plugin:...'`)
		plugins: {
			'@typescript-eslint': tsPlugin,
			'react': reactPlugin,
			'react-hooks': pluginReactHooks,
			'simple-import-sort': pluginSimpleImportSort,
			'jsx-a11y': pluginA11y,
			'prettier': pluginPrettier,
			'unicorn': pluginUnicorn,
			'import': pluginImport,
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
			'react-hooks': { additionalEffectHooks: '' },
		},

		rules: {
			// --- Импорты ---
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

			// --- Отступы / padding ---
			'padding-line-between-statements': [
				'error',
				{ blankLine: 'always', prev: '*', next: 'return' },
				{ blankLine: 'always', prev: 'block-like', next: 'export' },
			],

			// --- React Hooks ---
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': ['warn', { additionalHooks: '^use[A-Z]\\w*' }],

			// --- TypeScript ---
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'error',

			// --- Общие ---
			'prettier/prettier': 'error',
			'no-var': 'error',
			'prefer-const': 'error',
			'eqeqeq': ['error', 'always'],
			'consistent-return': 'error',
			'no-console': ['error', { allow: ['warn', 'error'] }],

			// React rules (нужен eslint-plugin-react)
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',

			// A11y
			'jsx-a11y/anchor-is-valid': 'warn',
			'jsx-a11y/alt-text': 'warn',
			'jsx-a11y/click-events-have-key-events': 'warn',
			'jsx-a11y/no-static-element-interactions': 'warn',

			// Unicorn
			'unicorn/prefer-includes': 'error',
			'unicorn/prefer-string-starts-ends-with': 'error',
			'unicorn/prefer-optional-catch-binding': 'error',
			'unicorn/no-null': 'off',
			'unicorn/prefer-logical-operator-over-ternary': 'warn',
			'unicorn/no-useless-undefined': 'error',
			'unicorn/filename-case': 'off',

			// Прочее
			'no-shadow': 'error',
			'no-magic-numbers': [
				'warn',
				{ ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true },
			],
			'prefer-arrow-callback': 'error',
			'prefer-destructuring': ['error', { object: true, array: false }],
			'object-shorthand': ['error', 'always'],
		},
	},
];
