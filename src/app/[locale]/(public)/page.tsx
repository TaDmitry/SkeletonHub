'use client';

import { useTranslations } from 'next-intl';

import { BlogFeatures } from '@/entities/blog';
import { SpiderCanvas } from '@components/index';
import { Button, Text, Title } from '@ui/index';
import { NavBarWidget } from '@widgets/layout/NavBar';

import styles from './RootLayout.module.scss';

export default function HomePage() {
	const t = useTranslations('pages.home.HomePage');

	return (
		<div className={styles.container}>
			<NavBarWidget />
			<section className={styles.content}>
				<div className={styles.heroWrapper}>
					<div className={styles.hero}>
						<Title className={styles.heading}>{t('hero.title')}</Title>
					</div>

					<div className={styles.heroInner}>
						<div className={styles.descriptionWrapper}>
							<Text
								className={styles.description}
								align='center'
							>
								{t.rich('hero.description', {
									brand: (chunks: React.ReactNode) => <span>{chunks}</span>,
								})}
							</Text>
						</div>

						<div className={styles.buttons}>
							<Button
								text={t('buttons.learn')}
								className={styles.learn}
							/>
							<Button
								text={t('buttons.features')}
								className={styles.features}
							/>
						</div>
					</div>
				</div>
			</section>
			{/* // TODO: Временно отключил блог. Нужно будет потом переделать дизайн блокаи его логику */}
			<section className={styles.blog}>
				<BlogFeatures />
			</section>
			<SpiderCanvas
				connectDots
				adaptive
				className={styles.spiderCanvas}
			/>
		</div>
	);
}
