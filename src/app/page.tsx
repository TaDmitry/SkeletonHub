'use client';

import React from 'react';
import { SpiderCanvas } from '@components';
import { Button, Icon, Text, Title } from '@ui';

import { NavBarWidget } from '@widgets/layout/NavBar';

import styles from './RootLayout.module.scss';

export default function Home() {
	return (
		<div className={styles.container}>
			<NavBarWidget />

			<section className={styles.content}>
				<div className={styles.heroWrapper}>
					<div className={styles.hero}>
						<Title className={styles.heading}>SkeletonUI: библиотека</Title>
					</div>

					<div className={styles.heroInner}>
						<div className={styles.descriptionWrapper}>
							<Text
								className={styles.description}
								align='center'
							>
								Начните с чистого скелета, <span>SkeletonUI</span> создаёт основу для вашего дизайна
								<Icon
									icon='Language'
									size={20}
								/>
							</Text>
						</div>

						<div className={styles.buttons}>
							<Button
								text='Ознакомится с SkeletonUI'
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
