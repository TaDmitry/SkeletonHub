import { z } from 'zod';

const EMAIL_MAX_LENGTH = 160;
const EMAIL_SCHEMA = z.email();

export const NEWSLETTER_VALIDATION_MESSAGE_PREFIX = 'validation.newsletter.';

export const newsletterSchema = z.object({
	email: z
		.string()
		.trim()
		.max(EMAIL_MAX_LENGTH, 'validation.newsletter.email.tooLong')
		.refine((value) => value.length > 0, {
			message: 'validation.newsletter.email.empty',
		})
		.refine((value) => value.length === 0 || EMAIL_SCHEMA.safeParse(value).success, {
			message: 'validation.newsletter.email.invalid',
		}),
});

export type NewsletterSchemaInput = z.input<typeof newsletterSchema>;
export type NewsletterSchemaValues = z.output<typeof newsletterSchema>;
