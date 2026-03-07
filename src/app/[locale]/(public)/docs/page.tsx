import { useTranslations } from 'next-intl';

import { Link } from '@/shared/config/i18n/navigation';
import { Text, Title } from '@/shared/ui/index';

import styles from './page.module.scss';

export default function DocsPage() {
	const t = useTranslations('pages.docs.DocsPage');

	return (
		<section className={styles.page}>
			<header className={styles.header}>
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
			</header>

			<div className={styles.grid}>
				<article className={styles.card}>
					<Title
						tag='h2'
						align='Left'
						className={styles.cardTitle}
					>
						{t('cards.news.title')}
					</Title>
					<Text
						align='Left'
						className={styles.cardDescription}
					>
						{t('cards.news.description')}
					</Text>
					<Link
						href='/blog'
						className={styles.cardLink}
					>
						{t('cards.news.link')}
					</Link>
				</article>

				<article className={styles.card}>
					<Title
						tag='h2'
						align='Left'
						className={styles.cardTitle}
					>
						{t('cards.team.title')}
					</Title>
					<Text
						align='Left'
						className={styles.cardDescription}
					>
						{t('cards.team.description')}
					</Text>
					<Link
						href='/team'
						className={styles.cardLink}
					>
						{t('cards.team.link')}
					</Link>
				</article>

				<article className={styles.card}>
					<Title
						tag='h2'
						align='Left'
						className={styles.cardTitle}
					>
						{t('cards.analytics.title')}
					</Title>
					<Text
						align='Left'
						className={styles.cardDescription}
					>
						{t('cards.analytics.description')}
					</Text>
					<Link
						href='/analytics'
						className={styles.cardLink}
					>
						{t('cards.analytics.link')}
					</Link>
				</article>

				<article className={styles.card}>
					<Title
						tag='h2'
						align='Left'
						className={styles.cardTitle}
					>
						{t('cards.governance.title')}
					</Title>
					<Text
						align='Left'
						className={styles.cardDescription}
					>
						{t('cards.governance.description')}
					</Text>
					<Link
						href='/governance'
						className={styles.cardLink}
					>
						{t('cards.governance.link')}
					</Link>
				</article>

				<article className={styles.card}>
					<Title
						tag='h2'
						align='Left'
						className={styles.cardTitle}
					>
						{t('cards.feedback.title')}
					</Title>
					<Text
						align='Left'
						className={styles.cardDescription}
					>
						{t('cards.feedback.description')}
					</Text>
					<Link
						href='/contact'
						className={styles.cardLink}
					>
						{t('cards.feedback.link')}
					</Link>
				</article>
			</div>
		</section>
	);
}
