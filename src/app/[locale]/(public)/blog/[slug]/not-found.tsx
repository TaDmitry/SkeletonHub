import { getTranslations } from 'next-intl/server';

import { Button, Icon, Text, Title } from '@ui/index';

import styles from './not-found.module.scss';

export default async function BlogPostNotFound() {
	const t = await getTranslations('pages.blog.BlogPostNotFound');

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<Title className={styles.title}>{t('title')}</Title>
				<Text
					align='Center'
					className={styles.description}
				>
					{t('description')}
				</Text>

				<Button
					href='/blog'
					className={styles.button}
					text={t('button')}
					icon={
						<Icon
							icon='ArrowBack'
							className={styles.icon}
						/>
					}
				/>
			</div>
		</div>
	);
}
