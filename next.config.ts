import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import fs from 'fs';
import path from 'path';

function readTsConfig() {
	try {
		const raw = fs.readFileSync(path.resolve(process.cwd(), 'tsconfig.json'), 'utf8');

		return JSON.parse(raw);
	} catch (e) {
		console.warn('Не удалось прочитать tsconfig.json:', e);

		return {};
	}
}

const withNextIntl = createNextIntlPlugin('./src/shared/config/i18n/request.ts');

const tsconfig = readTsConfig();
const baseUrl = tsconfig?.compilerOptions?.baseUrl ?? '.';

const nextConfig: NextConfig & { turbopack?: any } = {
	sassOptions: {
		includePaths: [path.resolve(process.cwd(), baseUrl)],
	},

	allowedDevOrigins: [
		'http://localhost:3000',
		'http://192.168.1.22:3000',
		'http://192.168.64.123:3000',
	],

	webpack(config) {
		const hasSvgRule = config.module.rules.some(
			(r: any) => r.test && r.test.toString().includes('\\.svg')
		);
		if (!hasSvgRule) {
			config.module.rules.push({
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
			});
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
