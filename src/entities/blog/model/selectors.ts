import { BLOG_POSTS } from './blogData';

const SORT_DESC = -1;

export function getAllBlogPosts() {
	const withIndex = BLOG_POSTS.map((post, index) => ({ post, index }));

	withIndex.sort((a, b) => {
		if (a.post.date === b.post.date) return a.index - b.index;

		return a.post.date < b.post.date ? 1 : SORT_DESC;
	});

	return withIndex.map((x) => x.post);
}

export function getBlogPostBySlug(slug: string) {
	return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}
