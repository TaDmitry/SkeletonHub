/** @type {import('stylelint').Config} */
export default {
	extends: [
		'stylelint-config-standard-scss',
		'stylelint-config-css-modules',

		'stylelint-config-clean-order',
	],

	customSyntax: 'postcss-scss',

	ignoreFiles: [
		'**/.next/**',
		'**/out/**',
		'**/dist/**',
		'**/node_modules/**',
		'**/*.js',
		'**/*.jsx',
		'**/*.ts',
		'**/*.tsx',
		'**/*.d.ts',
	],

	rules: {
		'selector-class-pattern': [
			'^[a-z][a-zA-Z0-9]*(-[a-z0-9]+)*$',
			{
				message: 'Expected class selector to be camelCase or kebab-case (CSS Modules friendly)',
			},
		],

		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global', 'local'],
			},
		],

		'scss/at-mixin-argumentless-call-parentheses': 'never',
		'scss/comment-no-loud': null,

		'order/properties-order': null,

		'declaration-block-no-duplicate-properties': [
			true,
			{
				ignore: ['consecutive-duplicates-with-different-values'],
			},
		],

		'custom-property-pattern': null,

		'no-descending-specificity': null,

		'selector-max-id': null,
	},
};
