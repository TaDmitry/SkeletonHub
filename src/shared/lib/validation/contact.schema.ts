import { z } from 'zod';

import { CONTACT_FORM_VALIDATION_CONFIG } from './contactValidationConfig';

const {
	name: { min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH },
	email: { max: EMAIL_MAX_LENGTH },
	telegram: { max: TELEGRAM_MAX_LENGTH },
	message: { min: MESSAGE_MIN_LENGTH, max: MESSAGE_MAX_LENGTH },
} = CONTACT_FORM_VALIDATION_CONFIG;
const TELEGRAM_USERNAME_PATTERN = /^@?[A-Za-z0-9_]{5,32}$/;
const EMAIL_SCHEMA = z.email();

export const CONTACT_VALIDATION_MESSAGE_PREFIX = 'validation.contact.';

export const contactSchema = z.object({
	name: z
		.string()
		.trim()
		.max(NAME_MAX_LENGTH, 'validation.contact.name.tooLong')
		.refine((value) => value.length > 0, {
			message: 'validation.contact.name.empty',
		})
		.refine((value) => value.length === 0 || value.length >= NAME_MIN_LENGTH, {
			message: 'validation.contact.name.tooShort',
		}),
	email: z
		.string()
		.trim()
		.max(EMAIL_MAX_LENGTH, 'validation.contact.email.tooLong')
		.refine((value) => value.length > 0, {
			message: 'validation.contact.email.empty',
		})
		.refine((value) => value.length === 0 || EMAIL_SCHEMA.safeParse(value).success, {
			message: 'validation.contact.email.invalid',
		}),
	telegram: z
		.string()
		.trim()
		.max(TELEGRAM_MAX_LENGTH, 'validation.contact.telegram.tooLong')
		.refine((value) => value.length === 0 || TELEGRAM_USERNAME_PATTERN.test(value), {
			message: 'validation.contact.telegram.invalid',
		})
		.optional(),
	message: z
		.string()
		.trim()
		.max(MESSAGE_MAX_LENGTH, 'validation.contact.message.tooLong')
		.refine((value) => value.length > 0, {
			message: 'validation.contact.message.empty',
		})
		.refine((value) => value.length === 0 || value.length >= MESSAGE_MIN_LENGTH, {
			message: 'validation.contact.message.tooShort',
		}),
});

export type ContactSchemaInput = z.input<typeof contactSchema>;
export type ContactSchemaValues = z.output<typeof contactSchema>;
