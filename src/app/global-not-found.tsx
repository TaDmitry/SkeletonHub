import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { routing } from '@config/i18n/routing';
import { Text, Title } from '@ui/index';

import '@styles/globals.scss';
import styles from './globalNotFound.module.scss';

const inter = Inter({ subsets: ['latin'] });

type Locale = (typeof routing.locales)[number];

async function getLocale(): Promise<Locale> {
	const headersList = await headers();
	const pathname = headersList.get('x-pathname') ?? '';

	const locale = routing.locales.find((l) => pathname.startsWith(`/${l}`));

	return locale ?? routing.defaultLocale;
}

export default async function GlobalNotFound() {
	const locale = await getLocale();

	const t = await getTranslations({
		locale,
		namespace: 'pages.globalNotFound',
	});

	return (
		<html
			lang={locale}
			className={(inter.className, styles.html)}
		>
			<body className={styles.container}>
				<div className={styles.content}>
					<Title className={styles.title}>{t('title')}</Title>
					<Text align='center'>{t('description')}</Text>
				</div>
			</body>
		</html>
	);
}
