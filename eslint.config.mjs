import { dirname } from 'path';
import { fileURLToPath } from 'url';
import tsParser from '@typescript-eslint/parser';
import { FlatCompat } from '@eslint/eslintrc';

//* Плагины ESLint
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginA11y from 'eslint-plugin-jsx-a11y';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginUnicorn from 'eslint-plugin-unicorn';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
	{
		ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
	}, //* Расширения базовых конфигураций
	...compat.extends(
		'next/core-web-vitals',
		'next/typescript',
		'plugin:@typescript-eslint/recommended',
		'eslint-config-prettier'
	), //* Основная конфигурация для проекта
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
			//* Сортировка импортов
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

			//* Отступы
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
			'react/jsx-sort-props': 'off',
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
];

export default eslintConfig;
