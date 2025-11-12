'use client';

import React from 'react';
import { SpiderCanvas } from '@components';
import { Title } from '@ui';

import styles from './RootLayout.module.scss';

export default function Home() {
	return (
		<section className={styles.container}>
			<div className={styles.content}>
				<div className={styles.hero}>
					<Title className={styles.heading}>React-VanillaUI: библиотека</Title>
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
