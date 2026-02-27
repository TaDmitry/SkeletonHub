import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from '@/shared/config/i18n/routing';

const intlMiddleware = createMiddleware(routing);
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

type AppLocale = (typeof routing.locales)[number];

function isAppLocale(value: string): value is AppLocale {
	return routing.locales.includes(value as AppLocale);
}

function resolveLocale(request: NextRequest): AppLocale {
	const localeFromCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

	if (localeFromCookie && isAppLocale(localeFromCookie)) {
		return localeFromCookie;
	}

	const acceptLanguage = request.headers.get('accept-language');

	if (acceptLanguage) {
		const preferredLocales = acceptLanguage
			.split(',')
			.map((part) => part.split(';')[0]?.trim().toLowerCase())
			.filter(Boolean);

		for (const candidate of preferredLocales) {
			const [baseLocale = ''] = candidate.split('-');

			if (isAppLocale(baseLocale)) {
				return baseLocale;
			}
		}
	}

	return routing.defaultLocale;
}

export default function middleware(request: NextRequest) {
	const response = intlMiddleware(request);

	//* Передал языковой стандарт в файл global-not-found.tsx
	response.headers.set('x-locale', resolveLocale(request));

	return response;
}

export const config = {
	matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
