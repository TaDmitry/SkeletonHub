import type { MetadataRoute } from 'next';

// import { getAllBlogPosts } from '@/entities/blog';
import { getAllBlogPosts } from '@/entities/blog';
import { routing } from '@/shared/config/i18n/routing';
import { getAlternatesByLocale, localizedAbsoluteUrl } from '@/shared/config/seo';

type SitemapEntry = MetadataRoute.Sitemap[number];

function toDate(value: string) {
	const isoDate = new Date(value);

	if (!Number.isNaN(isoDate.getTime())) {
		return isoDate;
	}

	return new Date(`${value}T00:00:00.000Z`);
}

function dedupeByUrl(entries: SitemapEntry[]) {
	return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}

function createLocalizedEntries(path: string, metadata: Omit<SitemapEntry, 'url' | 'alternates'>) {
	const alternates = { languages: getAlternatesByLocale(path) };

	const entries = routing.locales.map((locale) => ({
		url: localizedAbsoluteUrl(path, locale),
		alternates,
		...metadata,
	}));

	return dedupeByUrl(entries);
}

export default function sitemap(): MetadataRoute.Sitemap {
	const staticPaths = [
		{
			path: '/',
			changeFrequency: 'weekly' as const,
			priority: 1,
		},
		{
			path: '/blog',
			changeFrequency: 'daily' as const,
			priority: 0.9,
		},
	];

	const staticPages = staticPaths.flatMap((item) =>
		createLocalizedEntries(item.path, {
			lastModified: new Date(),
			changeFrequency: item.changeFrequency,
			priority: item.priority,
		})
	);

	const blogPagesByLocale = routing.locales.flatMap((locale) => {
		const posts = getAllBlogPosts(locale);

		return posts.map((post) => {
			return {
				url: localizedAbsoluteUrl(`/blog/${post.slug}`, locale),
				lastModified: toDate(post.updatedAt ?? post.date),
				changeFrequency: 'monthly' as const,
				priority: 0.7,
				alternates: {
					languages: getAlternatesByLocale(`/blog/${post.slug}`),
				},
			};
		});
	});

	const blogPages = dedupeByUrl(blogPagesByLocale);

	return [...staticPages, ...blogPages];
}
