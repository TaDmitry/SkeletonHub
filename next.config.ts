import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

interface TsConfig {
	compilerOptions: {
		baseUrl: string;
		paths?: Record<string, string[]>;
	};
}

const tsconfig: TsConfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));
const paths = tsconfig.compilerOptions.paths || {};

const sassAlias: Record<string, string> = {};

for (const [key, value] of Object.entries(paths)) {
	const aliasKey = key.replace('/*', '');
	const aliasPath = (value as string[])[0].replace('/*', '');
	sassAlias[aliasKey] = path.join(__dirname, tsconfig.compilerOptions.baseUrl, aliasPath);
}

const nextConfig: NextConfig = {
	sassOptions: {
		includePaths: [path.join(__dirname, tsconfig.compilerOptions.baseUrl)],
		alias: sassAlias,
	},
	webpack: (config) => {
		for (const [key, value] of Object.entries(paths)) {
			const aliasKey = key.replace('/*', '');
			const aliasPath = (value as string[])[0].replace('/*', '');
			config.resolve.alias![aliasKey] = path.join(
				__dirname,
				tsconfig.compilerOptions.baseUrl,
				aliasPath
			);
		}

		return config;
	},
};

export default nextConfig;
