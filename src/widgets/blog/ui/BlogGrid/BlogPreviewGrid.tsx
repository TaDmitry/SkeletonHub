'use client';

import clsx from 'clsx';

import { BlogCard, getAllBlogPosts } from '@/entities/blog';

import styles from './BlogPreviewGrid.module.scss';

type Props = {
	limit?: number;
	className?: string;
};

export const BlogPreviewGrid = ({ limit, className }: Props) => {
	const allPosts = getAllBlogPosts();
	const posts = typeof limit === 'number' ? allPosts.slice(0, limit) : allPosts;

	return (
		<section
			className={clsx(styles.root, className)}
			aria-label='Новости'
		>
			<div className={styles.grid}>
				{posts.map((post) => (
					<BlogCard
						key={post.slug}
						post={post}
						href={`/blog/${post.slug}`}
					/>
				))}
			</div>
		</section>
	);
};
