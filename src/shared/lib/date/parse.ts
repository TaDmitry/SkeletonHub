import { isValid, parseISO } from 'date-fns';

import type { DateInput } from './types';

function parseDate(value: DateInput) {
	if (value instanceof Date) {
		return value;
	}

	if (typeof value === 'number') {
		return new Date(value);
	}

	return parseISO(value);
}

export function toValidDate(value: DateInput) {
	const date = parseDate(value);

	if (!isValid(date)) {
		throw new RangeError(`Invalid date value: ${String(value)}`);
	}

	return date;
}
