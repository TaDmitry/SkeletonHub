'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import clsx from 'clsx';

import { formatDate } from '@/shared/lib/date';
import { Text, Title } from '@ui/index';

import type { BlogPost } from '../../model/types';

import styles from './BlogCard.module.scss';

type Props = {
	post: BlogPost;
	href: string;
	className?: string;
};

export const BlogCard = ({ post, href, className }: Props) => {
	const locale = useLocale();
	const formatted = formatDate(post.date, 'long', locale);

	return (
		<Link
			href={href}
			className={clsx(styles.card, className)}
		>
			<article className={styles.inner}>
				<time
					className={styles.date}
					dateTime={post.date}
				>
					{formatted}
				</time>
				<header className={styles.header}>
					<Title
						tag='h3'
						align='Left'
						className={styles.title}
					>
						{post.title}
					</Title>
				</header>

				<Text className={styles.excerpt}>{post.excerpt}</Text>
			</article>
		</Link>
	);
};
