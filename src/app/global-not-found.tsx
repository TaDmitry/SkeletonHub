import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import clsx from 'clsx';

import { routing } from '@/shared/config/i18n/routing';
import { Text, Title } from '@/shared/ui/index';

import '@/shared/styles/globals.scss';
import styles from './globalNotFound.module.scss';

const inter = Inter({ subsets: ['latin'] });

type Locale = (typeof routing.locales)[number];

async function getLocale(): Promise<Locale> {
	const headersList = await headers();
	const rawLocale = headersList.get('x-locale');
	const locale = rawLocale ? routing.locales.find((value) => value === rawLocale) : undefined;

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
			className={clsx(inter.className, styles.html)}
		>
			<body className={styles.container}>
				<div className={styles.content}>
					<Title className={styles.title}>{t('title')}</Title>
					<Text align='Center'>{t('description')}</Text>
				</div>
			</body>
		</html>
	);
}
