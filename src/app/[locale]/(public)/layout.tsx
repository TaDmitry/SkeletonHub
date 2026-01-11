import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, setRequestLocale } from 'next-intl/server';

import { routing } from '@/shared/config/i18n/routing';

import '@styles/globals.scss';

type Props = {
	children: React.ReactNode;
	params: { locale: string };
};

export const metadata: Metadata = {
	title: 'SkeletonHub',
	description: 'SkeletonHub',
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

export default async function RootLayout({ children, params }: Props) {
	const paramsResolved = await params;
	const locale = paramsResolved?.locale as string;

	if (!locale || !hasLocale(routing.locales, locale)) {
		notFound();
	}

	setRequestLocale(locale);
	const currentLocale = await getLocale();
	const messages = await getMessages();

	return (
		<html lang={currentLocale}>
			<body>
				<NextIntlClientProvider
					locale={currentLocale}
					messages={messages}
				>
					<main>{children}</main>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
