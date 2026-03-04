import { NextResponse } from 'next/server';

import { sendContactTelegramMessage } from '@/shared/lib/telegram/sendContactTelegramMessage';
import { contactSchema } from '@/shared/lib/validation/contact.schema';

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

export async function POST(request: Request) {
	const body = await parseBody(request);

	if (!body) {
		const response: ContactApiError = {
			success: false,
			error: 'Invalid JSON payload.',
		};

		return NextResponse.json(response, { status: 400 });
	}

	const parsedPayload = contactSchema.safeParse(body);

	if (!parsedPayload.success) {
		const response: ContactApiError = {
			success: false,
			error: 'Validation failed.',
			issues: parsedPayload.error.flatten().fieldErrors,
		};

		return NextResponse.json(response, { status: 400 });
	}

	const telegramResult = await sendContactTelegramMessage(parsedPayload.data);

	if (!telegramResult.success) {
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
