import type { ContactApiError, ContactApiSuccess, ContactRequestFieldErrors } from './schema';

const HTTP_BAD_REQUEST_STATUS = 400;
const HTTP_INTERNAL_SERVER_ERROR_STATUS = 500;

function createContactErrorResponse(response: ContactApiError, status: number): Response {
	return Response.json(response, { status });
}

export function createInvalidJsonResponse(): Response {
	const response: ContactApiError = { success: false, error: 'Invalid JSON payload.' };

	return createContactErrorResponse(response, HTTP_BAD_REQUEST_STATUS);
}

export function createValidationErrorResponse(issues: ContactRequestFieldErrors): Response {
	const response: ContactApiError = { success: false, error: 'Validation failed.', issues };

	return createContactErrorResponse(response, HTTP_BAD_REQUEST_STATUS);
}

export function createSendMessageErrorResponse(): Response {
	const response: ContactApiError = { success: false, error: 'Unable to process contact request.' };

	return createContactErrorResponse(response, HTTP_INTERNAL_SERVER_ERROR_STATUS);
}

export function createSuccessResponse(): Response {
	const response: ContactApiSuccess = { success: true };

	return Response.json(response, { status: 200 });
}
