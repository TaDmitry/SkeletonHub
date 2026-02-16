export type BlogLocale = 'en' | 'ru';

export type BlogPost = {
	slug: string;
	date: string;
	updatedAt?: string;
	title: string;
	excerpt: string;
	content: string[];
};

export type BlogPostTranslation = Pick<BlogPost, 'title' | 'excerpt' | 'content'>;

export type LocalizedBlogPost = {
	slug: string;
	date: string;
	updatedAt?: string;
	translations: Record<BlogLocale, BlogPostTranslation>;
};
