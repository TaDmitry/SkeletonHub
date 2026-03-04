import React from 'react';
import { useTranslations } from 'next-intl';

import { Button, SpiderCanvas, Text, Title } from '@/shared/ui/index';
import { BlogPreviewGrid } from '@/widgets/blog';
import { ContactFormWidget } from '@/widgets/contact';

import styles from './page.module.scss';

export default function HomePage() {
	const t = useTranslations('pages.home.HomePage');

	const renderBrand = (chunks: React.ReactNode) => <span>{chunks}</span>;

	return (
		<>
			<section>
				<div className={styles.heroLayout}>
					<section className={styles.heroContent}>
						<div className={styles.heroBlock}>
							<div className={styles.heroCard}>
								<Title className={styles.heroTitle}>{t('hero.title')}</Title>
							</div>

							<div className={styles.heroBody}>
								<div className={styles.heroDescription}>
									<Text
										className={styles.descriptionText}
										align='Center'
									>
										{t.rich('hero.description', { brand: renderBrand })}
									</Text>
								</div>

								<div className={styles.actions}>
									<Button
										text={t('buttons.learn')}
										className={styles.primaryButton}
									/>
									<Button
										text={t('buttons.features')}
										className={styles.secondaryButton}
									/>
								</div>
							</div>
						</div>
					</section>

					<SpiderCanvas
						connectDots
						adaptive
						className={styles.backgroundCanvas}
					/>
				</div>
			</section>

			<section className={styles.blogSection}>
				<header className={styles.blogHeader}>
					<Title
						className={styles.blogTitle}
						tag='h2'
					>
						{t('blog.title')}
					</Title>
					<Text align='Center'>{t('blog.subtitle')}</Text>
				</header>

				<BlogPreviewGrid limit={6} />
			</section>

			<section className={styles.contactSection}>
				<ContactFormWidget />
			</section>
		</>
	);
}
