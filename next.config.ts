import type { NextConfig } from 'next';
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

const tsconfig = readTsConfig();
const baseUrl = tsconfig?.compilerOptions?.baseUrl ?? '.';

const nextConfig: NextConfig = {
	sassOptions: {
		includePaths: [path.resolve(process.cwd(), baseUrl)],
	},

	allowedDevOrigins: ['http://localhost:3000', 'http://192.168.1.22:3000'],
};

export default nextConfig;
