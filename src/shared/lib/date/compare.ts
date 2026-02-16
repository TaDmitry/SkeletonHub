import { toValidDate } from './parse';
import type { DateInput } from './types';

export function toTimestamp(value: DateInput) {
	return toValidDate(value).getTime();
}
