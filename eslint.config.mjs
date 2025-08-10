import { dirname } from 'path';
import { fileURLToPath } from 'url';
import tsParser from '@typescript-eslint/parser';
import { FlatCompat } from '@eslint/eslintrc';

//* Плагины ESLint
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginA11y from 'eslint-plugin-jsx-a11y';
import pluginSonarjs from 'eslint-plugin-sonarjs';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginUnicorn from 'eslint-plugin-unicorn';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
	//* Расширения базовых конфигураций
	...compat.extends(
		'next/core-web-vitals',
		'next/typescript',
		'plugin:@typescript-eslint/recommended',
		'eslint-config-prettier'
	),
	//* Основная конфигурация для проекта
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
		files: ['**/*.{js,ts,jsx,tsx}'],
		plugins: {
			'simple-import-sort': pluginSimpleImportSort,
			'react-hooks': pluginReactHooks,
			'jsx-a11y': pluginA11y,
			'sonarjs': pluginSonarjs,
			'prettier': pluginPrettier,
			'unicorn': pluginUnicorn,
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
		},
		rules: {
			//* Сортировка импортов: external, alias, relative, стили
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
			//* Отключаем import/order чтобы избежать конфликтов
			'import/order': 'off',

			//* Пустая строка после всех импортов — только после последнего
			'import/newline-after-import': ['error', { count: 1 }],

			//* Отступы между другими блоками
			'padding-line-between-statements': [
				'error',
				{ blankLine: 'always', prev: '*', next: 'return' },
				{ blankLine: 'always', prev: 'block-like', next: 'export' },
			],

			//* Прочие правила
			'prettier/prettier': 'error',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'off',
			'no-var': 'error',
			'prefer-const': 'error',
			'eqeqeq': ['error', 'always'],
			'consistent-return': 'error',
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'react/jsx-sort-props': ['warn', { callbacksLast: true, shorthandFirst: true }],
			'jsx-a11y/anchor-is-valid': 'warn',
			'jsx-a11y/alt-text': 'warn',
			'jsx-a11y/click-events-have-key-events': 'warn',
			'jsx-a11y/no-static-element-interactions': 'warn',
			'sonarjs/cognitive-complexity': ['warn', 15],
			'sonarjs/no-duplicate-string': 'warn',
			'sonarjs/no-identical-functions': 'warn',
			'sonarjs/no-nested-switch': 'warn',
			'sonarjs/no-useless-catch': 'warn',
			'unicorn/prefer-includes': 'error',
			'unicorn/prefer-string-starts-ends-with': 'error',
			'unicorn/prefer-optional-catch-binding': 'error',
			'unicorn/no-null': 'warn',
			'unicorn/prefer-logical-operator-over-ternary': 'warn',
			'unicorn/no-useless-undefined': 'error',
			'unicorn/filename-case': 'off',
			'no-shadow': 'error',
			'no-magic-numbers': [
				'warn',
				{ ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true },
			],
			'prefer-arrow-callback': 'error',
			'prefer-destructuring': ['error', { object: true, array: false }],
			'object-shorthand': ['error', 'always'],
		},
		settings: { react: { version: 'detect' } },
	},

	//* Отключение правила sonarjs в папке локалей
	{ files: ['**/locales/**'], rules: { 'sonarjs/no-duplicate-string': 'off' } },
];

export default eslintConfig;
