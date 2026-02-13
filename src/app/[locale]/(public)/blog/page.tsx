import { useTranslations } from 'next-intl';

import { Title } from '@ui/index';
import { BlogPreviewGrid } from '@widgets/blog';

import styles from './page.module.scss';

export default function BlogPage() {
	const t = useTranslations('pages.blog.BlogPage');

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<Title
					align='Left'
					className={styles.title}
				>
					{t('title')}
				</Title>
			</div>

			<BlogPreviewGrid limit={6} />
		</div>
	);
}
