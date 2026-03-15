/** @type {import('stylelint').Config} */
export default {
	extends: [
		'stylelint-config-standard-scss',
		'stylelint-config-css-modules',
		'stylelint-config-clean-order',
	],

	customSyntax: 'postcss-scss',

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
		'scss/no-global-function-names': true,
		'import-notation': 'string',

		'declaration-block-no-duplicate-properties': [
			true,
			{
				ignore: ['consecutive-duplicates-with-different-values'],
			},
		],

		'custom-property-pattern': null,
		'rule-empty-line-before': null,

		'color-function-notation': 'modern',
		'color-no-hex': [true, { severity: 'warning' }],
		'color-named': 'never',
	},
};
