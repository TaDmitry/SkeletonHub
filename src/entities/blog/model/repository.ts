import { BLOG_POSTS } from './blogData';
import type { BlogLocale, BlogPost } from './types';

const DEFAULT_BLOG_LOCALE: BlogLocale = 'ru';

export function resolveBlogLocale(locale?: string): BlogLocale {
	return locale === 'en' ? 'en' : DEFAULT_BLOG_LOCALE;
}

function toBlogPost(
	locale: BlogLocale,
	slug: string,
	date: string,
	updatedAt: string | undefined,
	translations: (typeof BLOG_POSTS)[number]['translations']
): BlogPost {
	const localized = translations[locale] ?? translations[DEFAULT_BLOG_LOCALE];

	return {
		slug,
		date,
		updatedAt,
		title: localized.title,
		excerpt: localized.excerpt,
		content: localized.content,
	};
}

export function getBlogPostsForLocale(locale?: string): BlogPost[] {
	const resolvedLocale = resolveBlogLocale(locale);

	return BLOG_POSTS.map((post) =>
		toBlogPost(resolvedLocale, post.slug, post.date, post.updatedAt, post.translations)
	);
}

export function getBlogPostBySlugForLocale(slug: string, locale?: string): BlogPost | null {
	const resolvedLocale = resolveBlogLocale(locale);
	const post = BLOG_POSTS.find((item) => item.slug === slug);

	if (!post) {
		return null;
	}

	return toBlogPost(resolvedLocale, post.slug, post.date, post.updatedAt, post.translations);
}

export function getAllBlogPostSlugs() {
	return BLOG_POSTS.map((post) => post.slug);
}
