import { routing } from './i18n/routing';

const DEV_FALLBACK_SITE_URL = 'http://localhost:3000';
let hasLoggedMissingSiteUrl = false;

const OPEN_GRAPH_LOCALE_BY_APP_LOCALE = {
	en: 'en_US',
	ru: 'ru_RU',
} as const;

type AppLocale = (typeof routing.locales)[number];
type LocalePrefixMode = 'always' | 'as-needed' | 'never';

export const SITE_NAME = 'SkeletonHub';

function resolveLocalePrefixMode(): LocalePrefixMode {
	const { localePrefix } = routing;

	if (typeof localePrefix === 'string') {
		return localePrefix;
	}

	return localePrefix?.mode ?? 'always';
}

function hasHttpProtocol(url: string) {
	return /^https?:\/\//i.test(url);
}

function normalizeSiteUrl(rawUrl: string) {
	const withProtocol = hasHttpProtocol(rawUrl) ? rawUrl : `https://${rawUrl}`;
	const parsed = new URL(withProtocol);
	const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');

	return `${parsed.protocol}//${parsed.host}${pathname}`;
}

export function getSiteUrl() {
	const fromEnv = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;

	if (!fromEnv || fromEnv.trim().length === 0) {
		if (process.env.NODE_ENV === 'production' && !hasLoggedMissingSiteUrl) {
			console.error(
				'Missing NEXT_PUBLIC_SITE_URL or SITE_URL in production environment. Falling back to http://localhost:3000.'
			);
			hasLoggedMissingSiteUrl = true;
		}

		return DEV_FALLBACK_SITE_URL;
	}

	return normalizeSiteUrl(fromEnv.trim());
}

export function absoluteUrl(path = '/') {
	return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getLocalizedPath(path: string, locale: AppLocale) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	const { defaultLocale } = routing;
	const localePrefixMode = resolveLocalePrefixMode();

	if (localePrefixMode === 'never') {
		return normalizedPath;
	}

	if (localePrefixMode === 'as-needed' && locale === defaultLocale) {
		return normalizedPath;
	}

	return `/${locale}${normalizedPath}`;
}

export function localizedAbsoluteUrl(path: string, locale: AppLocale) {
	return absoluteUrl(getLocalizedPath(path, locale));
}

export function getAlternatesByLocale(path: string) {
	const pairs = routing.locales.map((locale) => [locale, localizedAbsoluteUrl(path, locale)]);

	return Object.fromEntries(pairs) as Record<AppLocale, string>;
}

export function getOpenGraphLocale(locale?: string) {
	if (locale && locale in OPEN_GRAPH_LOCALE_BY_APP_LOCALE) {
		return OPEN_GRAPH_LOCALE_BY_APP_LOCALE[locale as AppLocale];
	}

	return OPEN_GRAPH_LOCALE_BY_APP_LOCALE[routing.defaultLocale];
}
