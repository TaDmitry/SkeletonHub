import type { Metadata } from 'next';

import { Icon } from '@ui/Icon/Icon';

import '@styles/globals.scss';
import styles from './RootLayout.module.scss';

export const metadata: Metadata = {
	title: 'MyUI',
	description: 'MyUI',
	icons: {
		icon: '/icons/favicon.ico',
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='ru'>
			<body>
				<main className={styles.mainLayout}>
					<div className={styles.iconWrapper}>
						<Icon
							icon='CircleDecoration'
							className='icon'
						/>
					</div>
					<section className={styles.section}>{children}</section>
				</main>
			</body>
		</html>
	);
}
