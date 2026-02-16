import Link from 'next/link';
import { getLocale } from 'next-intl/server';

import { getBlogPostBySlug } from '@/entities/blog';
import { formatDate } from '@/shared/lib/date';
import { Button, Icon, Text, Title } from '@ui/index';

import styles from './page.module.scss';

type Props = {
	params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: Props) {
	const { slug } = await params;

	const post = getBlogPostBySlug(slug);
	const locale = await getLocale();

	if (!post) {
		return (
			<div className={styles.page}>
				<Link
					href='/blog'
					className={styles.back}
				>
					← К новостям
				</Link>

				<div className={styles.notFound}>
					<h1 className={styles.notFoundTitle}>Новость не найдена</h1>
					<p className={styles.notFoundText}>Проверь ссылку или вернись к списку новостей.</p>
				</div>
			</div>
		);
	}

	const formatted = formatDate(post.date, 'long', locale);

	return (
		<div className={styles.page}>
			<Button
				href='/blog'
				className={styles.back}
				text='К новостям'
				icon={
					<Icon
						icon='ArrowBack'
						className={styles.icon}
					/>
				}
			/>

			<article className={styles.card}>
				<div className={styles.header}>
					<time
						className={styles.date}
						dateTime={post.date}
					>
						<p>{formatted}</p>
					</time>
					<Title
						align='Left'
						className={styles.title}
					>
						{post.title}
					</Title>
				</div>

				<div className={styles.content}>
					{post.content.map((p, idx) => (
						<Text
							key={`${post.slug}-${idx}`}
							className={styles.paragraph}
						>
							{p}
						</Text>
					))}
				</div>
			</article>
		</div>
	);
}
