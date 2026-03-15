import { z } from 'zod';

const EMAIL_MAX_LENGTH = 254;
const EMAIL_SCHEMA = z.email();

export const subscribeRequestSchema = z.object({
	email: z
		.string()
		.trim()
		.max(EMAIL_MAX_LENGTH, 'validation.subscribe.email.tooLong')
		.refine((value) => value.length > 0, {
			message: 'validation.subscribe.email.empty',
		})
		.refine((value) => value.length === 0 || EMAIL_SCHEMA.safeParse(value).success, {
			message: 'validation.subscribe.email.invalid',
		}),
});

export type SubscribeRequestPayload = z.output<typeof subscribeRequestSchema>;
export type SubscribeRequestFieldErrors = Partial<Record<keyof SubscribeRequestPayload, string[]>>;

export type SubscribeApiSuccess = {
	success: true;
};

export type SubscribeApiError = {
	success: false;
	error: string;
	issues?: SubscribeRequestFieldErrors;
};
