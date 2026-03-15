import type { SubscribeApiError, SubscribeApiSuccess, SubscribeRequestFieldErrors } from './schema';

const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_CONFLICT_STATUS = 409;
const HTTP_INTERNAL_SERVER_ERROR_STATUS = 500;

function createSubscribeErrorResponse(response: SubscribeApiError, status: number): Response {
	return Response.json(response, { status });
}

export function createInvalidJsonResponse(): Response {
	const response: SubscribeApiError = { success: false, error: 'Invalid JSON payload.' };

	return createSubscribeErrorResponse(response, HTTP_BAD_REQUEST_STATUS);
}

export function createValidationErrorResponse(issues: SubscribeRequestFieldErrors): Response {
	const response: SubscribeApiError = { success: false, error: 'Validation failed.', issues };

	return createSubscribeErrorResponse(response, HTTP_BAD_REQUEST_STATUS);
}

export function createAlreadySubscribedResponse(): Response {
	const response: SubscribeApiError = {
		success: false,
		error: 'Email already subscribed.',
	};

	return createSubscribeErrorResponse(response, HTTP_CONFLICT_STATUS);
}

export function createSubscriptionFailedResponse(): Response {
	const response: SubscribeApiError = {
		success: false,
		error: 'Unable to subscribe email.',
	};

	return createSubscribeErrorResponse(response, HTTP_INTERNAL_SERVER_ERROR_STATUS);
}

export function createSuccessResponse(): Response {
	const response: SubscribeApiSuccess = { success: true };

	return Response.json(response, { status: 200 });
}
