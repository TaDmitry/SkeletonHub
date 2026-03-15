import { checkRateLimit } from '../_lib/rateLimit';
import { parseContactRequest } from './request';
import { createSendMessageErrorResponse, createSuccessResponse } from './responses';
import { submitContactRequest } from './service';

const CONTACT_RATE_LIMIT = {
	bucket: 'api/contact',
	limit: 5,
	windowMs: 600_000,
} as const;

export async function POST(request: Request) {
	const rateLimitResult = checkRateLimit(request, CONTACT_RATE_LIMIT);

	if (!rateLimitResult.success) {
		return rateLimitResult.response;
	}

	const parsedRequest = await parseContactRequest(request);

	if (!parsedRequest.success) {
		return parsedRequest.response;
	}

	const submitResult = await submitContactRequest(request, parsedRequest.data);

	if (!submitResult.success) {
		return createSendMessageErrorResponse();
	}

	return createSuccessResponse();
}
