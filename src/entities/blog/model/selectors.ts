import { toTimestamp } from '@/shared/lib/date';

import {
	getAllBlogPostSlugs,
	getBlogPostBySlugForLocale,
	getBlogPostsForLocale,
} from './repository';

export function getAllBlogPosts(locale?: string) {
	const localizedPosts = getBlogPostsForLocale(locale);
	const withIndex = localizedPosts.map((post, index) => ({ post, index }));

	withIndex.sort((a, b) => {
		const left = toTimestamp(a.post.date);
		const right = toTimestamp(b.post.date);

		if (left === right) return a.index - b.index;

		return right - left;
	});

	return withIndex.map((x) => x.post);
}

export function getBlogPostBySlug(slug: string, locale?: string) {
	return getBlogPostBySlugForLocale(slug, locale);
}

export { getAllBlogPostSlugs };

export { resolveBlogLocale } from './repository';
export type { BlogLocale } from './types';
