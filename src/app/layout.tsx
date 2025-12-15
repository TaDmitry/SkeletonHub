import type { Metadata } from 'next';

import '@styles/globals.scss';
import styles from './RootLayout.module.scss';

export const metadata: Metadata = {
	title: 'MyUI',
	description: 'MyUI',
	icons: {
		icon: [
			{ url: '/favicon/favicon.ico' },
			{ url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon/favicon.svg', type: 'image/svg+xml' },
		],
		apple: '/favicon/apple-touch-icon.png',
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
