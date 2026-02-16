import type { MetadataRoute } from 'next';

import { absoluteUrl, getSiteUrl } from '@/shared/config/seo';

export default function robots(): MetadataRoute.Robots {
	const isProduction = process.env.NODE_ENV === 'production';
	const rules: MetadataRoute.Robots['rules'] = isProduction
		? [{ userAgent: '*', allow: '/' }]
		: [{ userAgent: '*', disallow: '/' }];

	return {
		rules,
		host: getSiteUrl(),
		sitemap: absoluteUrl('/sitemap.xml'),
	};
}
