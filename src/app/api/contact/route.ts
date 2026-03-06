import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendContactTelegramMessage } from '@/shared/lib/telegram/sendContactTelegramMessage';
import { contactSchema } from '@/shared/lib/validation/contact.schema';

const contactRequestSchema = contactSchema.extend({
	pageUrl: z.string().trim().url().optional(),
});

type ContactApiSuccess = {
	success: true;
};

type ContactApiError = {
	success: false;
	error: string;
	issues?: Record<string, string[] | undefined>;
};

async function parseBody(request: Request): Promise<unknown | null> {
	try {
		return await request.json();
	} catch {
		return null;
	}
}

function resolvePageUrl(request: Request, pageUrl?: string) {
	return pageUrl ?? request.headers.get('referer') ?? request.headers.get('origin') ?? 'unknown';
}

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
		const issues = parsedPayload.error.flatten().fieldErrors;

		console.warn('[api/contact] Validation failed.', issues);

		const response: ContactApiError = {
			success: false,
			error: 'Validation failed.',
			issues,
		};

		return NextResponse.json(response, { status: 400 });
	}

	const { pageUrl, ...contactData } = parsedPayload.data;
	const telegramResult = await sendContactTelegramMessage(contactData, {
		pageUrl: resolvePageUrl(request, pageUrl),
		submittedAt: new Date(),
	});

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
