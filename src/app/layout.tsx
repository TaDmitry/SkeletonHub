import type { Metadata } from 'next';

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
				<main className={styles.mainLayout}>{children}</main>
			</body>
		</html>
	);
}
