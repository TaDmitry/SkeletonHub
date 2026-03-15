import { checkRateLimit } from '../_lib/rateLimit';
import { saveSubscriberEmail } from './repository';
import { parseSubscribeRequest } from './request';
import {
	createAlreadySubscribedResponse,
	createSubscriptionFailedResponse,
	createSuccessResponse,
} from './responses';

const SUBSCRIBE_RATE_LIMIT = {
	bucket: 'api/subscribe',
	limit: 10,
	windowMs: 600_000,
} as const;

export async function POST(request: Request) {
	const rateLimitResult = checkRateLimit(request, SUBSCRIBE_RATE_LIMIT);

	if (!rateLimitResult.success) {
		return rateLimitResult.response;
	}

	const parsedRequest = await parseSubscribeRequest(request);

	if (!parsedRequest.success) {
		return parsedRequest.response;
	}

	const saveResult = await saveSubscriberEmail(parsedRequest.data.email);

	if (!saveResult.success) {
		if (saveResult.reason === 'already-subscribed') {
			return createAlreadySubscribedResponse();
		}

		return createSubscriptionFailedResponse();
	}

	return createSuccessResponse();
}
