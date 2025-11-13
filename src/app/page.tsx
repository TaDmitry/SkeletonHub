'use client';

import React from 'react';
import { SpiderCanvas } from '@components';
import { Button, Text, Title } from '@ui';

import styles from './RootLayout.module.scss';

export default function Home() {
	return (
		<section className={styles.container}>
			<div className={styles.content}>
				<div className={styles.heroWrapper}>
					<div className={styles.hero}>
						<Title className={styles.heading}>VanillaUI: библиотека</Title>
					</div>

					<div className={styles.heroInner}>
						<div className={styles.descriptionWrapper}>
							<Text
								className={styles.description}
								align='center'
							>
								Основанная на принципах простоты и чистоты, <span>VanillaUI:</span> даёт
								разработчикам инструменты для создания интерфейсов, где красота и функциональность
								идут рука об руку.
							</Text>
						</div>

						<div className={styles.buttons}>
							<Button
								text='Ознакомится с VanillaUI'
								className={styles.learn}
							/>
							<Button
								text='Особенности'
								className={styles.features}
							/>
						</div>
					</div>
				</div>
			</div>

			<SpiderCanvas
				connectDots={true}
				adaptive={true}
				className={styles.spiderCanvas}
			/>
		</section>
	);
}
