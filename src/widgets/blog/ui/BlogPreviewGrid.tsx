import { getLocale, getTranslations } from 'next-intl/server';
import clsx from 'clsx';

import { BlogCard, getAllBlogPosts } from '@/entities/blog';

import styles from './BlogPreviewGrid.module.scss';

type Props = {
	limit?: number;
	className?: string;
	locale?: string;
};

export const BlogPreviewGrid = async ({ limit, className, locale: localeProp }: Props) => {
	const locale = localeProp ?? (await getLocale());
	const t = await getTranslations({
		locale,
		namespace: 'pages.blog.BlogPreviewGrid',
	});
	const allPosts = getAllBlogPosts(locale);
	const posts = typeof limit === 'number' ? allPosts.slice(0, limit) : allPosts;

	return (
		<section
			className={clsx(styles.root, className)}
			aria-label={t('ariaLabel')}
		>
			<div className={styles.grid}>
				{posts.map((post) => (
					<BlogCard
						key={post.slug}
						post={post}
						href={`/blog/${post.slug}`}
						locale={locale}
					/>
				))}
			</div>
		</section>
	);
};
