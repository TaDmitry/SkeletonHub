import { format, formatDistance } from 'date-fns';

import { getLongDatePattern, resolveDateFnsLocale } from './locale';
import { toValidDate } from './parse';
import type { DateFormatVariant, DateInput } from './types';

export const PROJECT_DATE_FORMATS: Record<DateFormatVariant, string> = {
	short: 'dd.MM.yy',
	long: 'long',
};

function resolveDatePattern(variant: DateFormatVariant, locale?: string) {
	if (variant === 'long') {
		return getLongDatePattern(locale);
	}

	return PROJECT_DATE_FORMATS[variant];
}

export function formatDate(
	value: DateInput,
	variant: DateFormatVariant = 'short',
	locale?: string
) {
	return format(toValidDate(value), resolveDatePattern(variant, locale), {
		locale: resolveDateFnsLocale(locale),
	});
}

export function formatRelativeDate(
	value: DateInput,
	baseDate: DateInput = new Date(),
	locale?: string
) {
	return formatDistance(toValidDate(value), toValidDate(baseDate), {
		addSuffix: true,
		locale: resolveDateFnsLocale(locale),
	});
}
