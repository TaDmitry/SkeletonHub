import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import fs from 'fs';
import path from 'path';

interface WebpackRule {
	test?: RegExp | string;
	issuer?: RegExp;
	use?: Array<{ loader: string; options?: Record<string, unknown> }>;
}

interface WebpackModule {
	rules?: WebpackRule[];
}

interface WebpackConfig {
	module?: WebpackModule;
	[key: string]: unknown;
}

function readTsConfig(): Record<string, unknown> {
	try {
		const raw = fs.readFileSync(path.resolve(process.cwd(), 'tsconfig.json'), 'utf8');
		const parsed = JSON.parse(raw);

		return typeof parsed === 'object' && parsed !== null ? parsed : {};
	} catch (err) {
		console.warn('Не удалось прочитать tsconfig.json:', err);

		return {};
	}
}

const withNextIntl = createNextIntlPlugin('./src/shared/config/i18n/request.ts');

const tsconfig = readTsConfig();
const baseUrl =
	((tsconfig?.compilerOptions as Record<string, unknown>)?.baseUrl as string | undefined) ?? '.';

const nextConfig: NextConfig & { turbopack?: Record<string, unknown> } = {
	sassOptions: {
		includePaths: [path.resolve(process.cwd(), baseUrl)],
	},

	allowedDevOrigins: [
		'http://localhost:3000',
		'http://192.168.1.22:3000',
		'http://192.168.64.123:3000',
		'http://192.168.25.155:3000',
	],

	webpack(config: WebpackConfig) {
		const rules = config.module?.rules ?? [];
		const hasSvgRule = rules.some((r) => r.test instanceof RegExp && r.test.test('.svg'));

		if (!hasSvgRule) {
			const svgRule: WebpackRule = {
				test: /\.svg$/i,
				issuer: /\.[jt]sx?$/,
				use: [
					{
						loader: require.resolve('@svgr/webpack'),
						options: {
							svgo: true,
							svgoConfig: {
								plugins: [
									{
										name: 'preset-default',
										params: { overrides: { removeViewBox: false } },
									},
								],
							},
							icon: true,
							replaceAttrValues: {
								'#000': 'currentColor',
								'#000000': 'currentColor',
								'black': 'currentColor',
							},
						},
					},
				],
			};

			if (!config.module) config.module = {};
			if (!Array.isArray(config.module.rules)) config.module.rules = [];
			config.module.rules.push(svgRule);
		}

		return config;
	},

	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},

	reactStrictMode: true,
};

export default withNextIntl(nextConfig);
