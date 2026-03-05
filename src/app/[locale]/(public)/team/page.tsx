import { useTranslations } from 'next-intl';

import { Text, Title } from '@/shared/ui/index';

import styles from './page.module.scss';

export default function TeamPage() {
	const t = useTranslations('pages.team.TeamPage');

	return (
		<section className={styles.page}>
			<Title
				align='Left'
				className={styles.title}
			>
				{t('title')}
			</Title>
			<Text
				align='Left'
				className={styles.description}
			>
				{t('description')}
			</Text>
		</section>
	);
}
