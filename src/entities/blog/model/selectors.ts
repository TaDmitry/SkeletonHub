import { toTimestamp } from '@/shared/lib/date';

import { BLOG_POSTS } from './blogData';

export function getAllBlogPosts() {
	const withIndex = BLOG_POSTS.map((post, index) => ({ post, index }));

	withIndex.sort((a, b) => {
		const left = toTimestamp(a.post.date);
		const right = toTimestamp(b.post.date);

		if (left === right) return a.index - b.index;

		return right - left;
	});

	return withIndex.map((x) => x.post);
}

export function getBlogPostBySlug(slug: string) {
	return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}
