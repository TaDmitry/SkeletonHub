import Link from 'next/link';

import type { BlogItem } from '@/entities/blog/model/blogData';

import styles from './FeatureCard.module.scss';

type Props = {
	item: BlogItem;
	className?: string;
};

export default function FeatureCard({ item, className }: Props) {
	return (
		<Link
			href={item.href ?? `/blog/${item.id}`}
			className={`${styles.card} ${className ?? ''}`}
		>
			<article
				className={styles.inner}
				role='article'
			>
				<h3 className={styles.title}>{item.title}</h3>
				<p className={styles.short}>{item.short}</p>
			</article>
		</Link>
	);
}
