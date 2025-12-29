'use client';

import { SpiderCanvas } from '@components/index';
import { Button, Text, Title } from '@ui/index';
import { NavBarWidget } from '@widgets/layout/NavBar';

import styles from './RootLayout.module.scss';

export default function HomePage() {
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
							</Text>
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
