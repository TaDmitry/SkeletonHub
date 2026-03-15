import { sendContactTelegramMessage } from '@/shared/lib/telegram';

import { enrichContactMetadata } from './metadata';
import { saveContactSubmission } from './repository';
import { toContactTelegramPayload } from './resolvers';
import type { ContactRequestPayload } from './schema';

export type SubmitContactRequestResult = { success: true } | { success: false };

export async function submitContactRequest(
	request: Request,
	payload: ContactRequestPayload
): Promise<SubmitContactRequestResult> {
	const contactData = toContactTelegramPayload(payload);
	const enrichedMetadata = await enrichContactMetadata(request, payload);
	const [saveResult, telegramResult] = await Promise.all([
		saveContactSubmission(payload, enrichedMetadata),
		sendContactTelegramMessage(contactData, enrichedMetadata),
	]);

	if (!saveResult.success && !telegramResult.success) {
		console.error('[api/contact] Contact submission failed for all delivery channels.', {
			telegramError: telegramResult.error,
		});

		return { success: false };
	}

	if (!saveResult.success) {
		console.warn(
			'[api/contact] Contact submission was sent to Telegram but not saved to Supabase.'
		);
	}

	if (!telegramResult.success) {
		console.warn(
			'[api/contact] Contact submission was saved to Supabase but Telegram delivery failed.',
			{
				telegramError: telegramResult.error,
			}
		);
	}

	return { success: true };
}
