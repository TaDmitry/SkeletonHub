import { format, formatDistance, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const PROJECT_DATE_FORMATS = {
	short: 'dd.MM.yy',
	long: "dd MMMM yyyy 'г.'",
} as const;

export type DateFormatVariant = keyof typeof PROJECT_DATE_FORMATS;
export type DateInput = Date | number | string;

function parseDate(value: DateInput) {
	if (value instanceof Date) {
		return value;
	}

	if (typeof value === 'number') {
		return new Date(value);
	}

	// parseISO keeps date-only values stable for SSR and clients.
	return parseISO(value);
}

function toValidDate(value: DateInput) {
	const date = parseDate(value);

	if (!isValid(date)) {
		throw new RangeError(`Invalid date value: ${String(value)}`);
	}

	return date;
}

export function toTimestamp(value: DateInput) {
	return toValidDate(value).getTime();
}

export function formatDate(value: DateInput, variant: DateFormatVariant = 'short') {
	return format(toValidDate(value), PROJECT_DATE_FORMATS[variant], { locale: ru });
}

export function formatRelativeDate(value: DateInput, baseDate: DateInput = new Date()) {
	return formatDistance(toValidDate(value), toValidDate(baseDate), {
		addSuffix: true,
		locale: ru,
	});
}
