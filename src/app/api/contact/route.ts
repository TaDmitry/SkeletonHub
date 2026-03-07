import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendContactTelegramMessage } from '@/shared/lib/telegram';

import { enrichContactMetadata } from './metadata';
import { parseBody, toContactTelegramPayload } from './resolvers';
import type { ContactApiError, ContactApiSuccess, ContactRequestFieldErrors } from './schema';
import { contactRequestSchema } from './schema';

export async function POST(request: Request) {
	const body = await parseBody(request);

	if (body === null) {
		console.error('[api/contact] Invalid JSON payload.');

		const response: ContactApiError = {
			success: false,
			error: 'Invalid JSON payload.',
		};

		return NextResponse.json(response, { status: 400 });
	}

	const parsedPayload = contactRequestSchema.safeParse(body);

	if (!parsedPayload.success) {
		const { fieldErrors } = z.flattenError(parsedPayload.error);
		const issues: ContactRequestFieldErrors = fieldErrors;

		console.warn('[api/contact] Validation failed.', issues);

		const response: ContactApiError = {
			success: false,
			error: 'Validation failed.',
			issues,
		};

		return NextResponse.json(response, { status: 400 });
	}

	const contactData = toContactTelegramPayload(parsedPayload.data);
	const enrichedMetadata = await enrichContactMetadata(request, parsedPayload.data);
	const telegramResult = await sendContactTelegramMessage(contactData, enrichedMetadata);

	if (!telegramResult.success) {
		console.error('[api/contact] Unable to send message.', telegramResult.error);

		const response: ContactApiError = {
			success: false,
			error: 'Unable to send message.',
		};

		return NextResponse.json(response, { status: 500 });
	}

	const response: ContactApiSuccess = {
		success: true,
	};

	return NextResponse.json(response, { status: 200 });
}
