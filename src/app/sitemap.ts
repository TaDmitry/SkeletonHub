import type { MetadataRoute } from 'next';

//* В будущем вынести в shared/config
const locales = ['ru', 'en'];

//* В будущем заменить на реальные данные (JSON / CMS)
const blogSlugs = ['css-support'];
const documentationSlugs = ['getting-started'];

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://your-domain.com';

	const now = new Date();

	const staticPages = locales.flatMap((locale) => [
		{
			url: `${baseUrl}/${locale}`,
			lastModified: now,
		},
		{
			url: `${baseUrl}/${locale}/blog`,
			lastModified: now,
		},
		{
			url: `${baseUrl}/${locale}/documentation`,
			lastModified: now,
		},
	]);

	const blogPages = locales.flatMap((locale) =>
		blogSlugs.map((slug) => ({
			url: `${baseUrl}/${locale}/blog/${slug}`,
			lastModified: now,
		}))
	);

	const documentationPages = locales.flatMap((locale) =>
		documentationSlugs.map((slug) => ({
			url: `${baseUrl}/${locale}/documentation/${slug}`,
			lastModified: now,
		}))
	);

	return [...staticPages, ...blogPages, ...documentationPages];
}
