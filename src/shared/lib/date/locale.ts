import { enUS, ru } from 'date-fns/locale';

import type { AppDateLocale } from './types';

const DEFAULT_DATE_LOCALE: AppDateLocale = 'ru';

const DATE_FNS_LOCALES = {
	en: enUS,
	ru,
} as const;

const LONG_DATE_FORMAT_BY_LOCALE: Record<AppDateLocale, string> = {
	en: 'dd MMMM yyyy',
	ru: 'dd MMMM yyyy',
};

export function resolveDateLocale(locale?: string): AppDateLocale {
	if (locale === 'en' || locale === 'ru') {
		return locale;
	}

	return DEFAULT_DATE_LOCALE;
}

export function resolveDateFnsLocale(locale?: string) {
	return DATE_FNS_LOCALES[resolveDateLocale(locale)];
}

export function getLongDatePattern(locale?: string) {
	return LONG_DATE_FORMAT_BY_LOCALE[resolveDateLocale(locale)];
}
