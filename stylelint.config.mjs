const config = {
	extends: [
		'stylelint-config-standard',
		'stylelint-config-recommended-scss',
		'stylelint-config-prettier-scss',
	],
	plugins: ['stylelint-scss'],
	ignoreFiles: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
	rules: {
		'no-empty-source': null,
		'selector-class-pattern': null,
		'max-nesting-depth': 3,
		'selector-pseudo-element-no-unknown': [
			true,
			{
				ignorePseudoElements: [
					'-webkit-scrollbar',
					'-webkit-scrollbar-thumb',
					'-webkit-scrollbar-track',
				],
			},
		],
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global'],
			},
		],
	},
};

export default config;
