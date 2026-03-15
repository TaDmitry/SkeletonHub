import { z } from 'zod';

import { createInvalidJsonResponse, createValidationErrorResponse } from './responses';
import type { SubscribeRequestFieldErrors, SubscribeRequestPayload } from './schema';
import { subscribeRequestSchema } from './schema';

export type ParseSubscribeRequestResult =
	| { success: true; data: SubscribeRequestPayload }
	| { success: false; response: Response };

async function parseBody(request: Request): Promise<unknown | null> {
	try {
		return await request.json();
	} catch {
		return null;
	}
}

export async function parseSubscribeRequest(
	request: Request
): Promise<ParseSubscribeRequestResult> {
	const body = await parseBody(request);

	if (body === null) {
		console.error('[api/subscribe] Invalid JSON payload.');

		return {
			success: false,
			response: createInvalidJsonResponse(),
		};
	}

	const parsedPayload = subscribeRequestSchema.safeParse(body);

	if (!parsedPayload.success) {
		const { fieldErrors } = z.flattenError(parsedPayload.error);
		const issues: SubscribeRequestFieldErrors = fieldErrors;
		console.warn('[api/subscribe] Validation failed.', issues);

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
