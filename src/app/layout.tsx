import type { Metadata } from 'next';

import { CircleDecoration } from '@shared/assets';

import '@styles/globals.scss';
import styles from './RootLayout.module.scss';

export const metadata: Metadata = {
	title: 'Historical Dates',
	description: 'Слайдер с историческими датами',
	icons: {
		icon: '/icons/favicon.ico',
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='ru'>
			<body>
				<main className={styles.mainLayout}>
					<div className={styles.circleDecoration}>
						<CircleDecoration />
					</div>
					<section className={styles.section}>{children}</section>
				</main>
			</body>
		</html>
	);
}
