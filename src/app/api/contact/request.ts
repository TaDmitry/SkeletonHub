import { z } from 'zod';

import { parseBody } from './resolvers';
import { createInvalidJsonResponse, createValidationErrorResponse } from './responses';
import type { ContactRequestFieldErrors, ContactRequestPayload } from './schema';
import { contactRequestSchema } from './schema';

export type ParseContactRequestResult =
	| { success: true; data: ContactRequestPayload }
	| { success: false; response: Response };

export async function parseContactRequest(request: Request): Promise<ParseContactRequestResult> {
	const body = await parseBody(request);

	if (body === null) {
		console.error('[api/contact] Invalid JSON payload.');

		return {
			success: false,
			response: createInvalidJsonResponse(),
		};
	}

	const parsedPayload = contactRequestSchema.safeParse(body);

	if (!parsedPayload.success) {
		const { fieldErrors } = z.flattenError(parsedPayload.error);
		const issues: ContactRequestFieldErrors = fieldErrors;
		console.warn('[api/contact] Validation failed.', issues);

		return {
			success: false,
			response: createValidationErrorResponse(issues),
		};
	}

	return {
		success: true,
		data: parsedPayload.data,
	};
}
