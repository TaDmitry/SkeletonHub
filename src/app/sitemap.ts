import type { MetadataRoute } from 'next';

const blogSlugs = ['css-support'];
const documentationSlugs = ['getting-started'];

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://your-domain.com';
	const now = new Date();

	const staticPages: MetadataRoute.Sitemap = [
		{
			url: `${baseUrl}/`,
			lastModified: now,
		},
		{
			url: `${baseUrl}/blog`,
			lastModified: now,
		},
		{
			url: `${baseUrl}/documentation`,
			lastModified: now,
		},
	];

	const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
		url: `${baseUrl}/blog/${slug}`,
		lastModified: now,
	}));

	const documentationPages: MetadataRoute.Sitemap = documentationSlugs.map((slug) => ({
		url: `${baseUrl}/documentation/${slug}`,
		lastModified: now,
	}));

	return [...staticPages, ...blogPages, ...documentationPages];
}
