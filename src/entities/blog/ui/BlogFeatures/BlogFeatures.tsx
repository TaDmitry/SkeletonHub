import React from 'react';

import { BLOG_DATA } from '@/entities/blog/model/blogData';

import FeatureCard from '../FeatureCard/FeatureCard';

import styles from './BlogFeatures.module.scss';

type Props = {
	ids?: string[];
	limit?: number;
};

export default function BlogFeatures({ ids, limit }: Props) {
	const items = React.useMemo(() => {
		const filtered = ids ? BLOG_DATA.filter((i) => ids.includes(i.id)) : BLOG_DATA;

		return limit ? filtered.slice(0, limit) : filtered;
	}, [ids, limit]);

	return (
		<section
			className={styles.grid}
			aria-label='Blog features'
		>
			{items.map((item) => (
				<FeatureCard
					key={item.id}
					item={item}
				/>
			))}
		</section>
	);
}
