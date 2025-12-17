'use client';

import { useTranslations } from 'next-intl';
import { SpiderCanvas } from '@components';
import { Button, Icon, Text, Title } from '@ui';

import { NavBarWidget } from '@widgets/layout/NavBar';

import styles from './RootLayout.module.scss';

export default function HomePage() {
	const t = useTranslations('HomePage');

	return (
		<div className={styles.container}>
			<NavBarWidget />

			<section className={styles.content}>
				<div className={styles.heroWrapper}>
					<div className={styles.hero}>
						<Title className={styles.heading}>SkeletonHub</Title>
					</div>

					<div className={styles.heroInner}>
						<div className={styles.descriptionWrapper}>
							<Text
								className={styles.description}
								align='center'
							>
								Начните с чистого скелета, <span>SkeletonHub</span> создаёт основу для вашего
								дизайна
								<Icon
									icon='Language'
									size={20}
								/>
							</Text>
							<p>{t('title')}</p>;
						</div>

						<div className={styles.buttons}>
							<Button
								text='Ознакомится с SkeletonHub'
								className={styles.learn}
							/>
							<Button
								text='Особенности'
								className={styles.features}
							/>
						</div>
					</div>
				</div>
			</section>

			<SpiderCanvas
				connectDots={true}
				adaptive={true}
				className={styles.spiderCanvas}
			/>
		</div>
	);
}
