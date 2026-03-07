import 'server-only';

import type { ContactSchemaValues } from '@/shared/lib/validation';

import { buildContactTelegramMessage, resolveRequestMetadata } from './buildContactTelegramMessage';
import type { SendContactMetadata, SendContactResult, TelegramResponse } from './types';

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org';
const TELEGRAM_REQUEST_TIMEOUT_MS = 10_000;

export async function sendContactTelegramMessage(
	payload: ContactSchemaValues,
	metadata: SendContactMetadata = {}
): Promise<SendContactResult> {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	const chatId = process.env.TELEGRAM_CHAT_ID;

	if (!token || !chatId) {
		console.error('[contact/telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.');

		return {
			success: false,
			error: 'Telegram configuration is missing.',
		};
	}

	const requestMetadata = resolveRequestMetadata(metadata);

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TELEGRAM_REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(`${TELEGRAM_API_BASE_URL}/bot${token}/sendMessage`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			cache: 'no-store',
			signal: controller.signal,
			body: JSON.stringify({
				chat_id: chatId,
				text: buildContactTelegramMessage(payload, requestMetadata),
			}),
		});

		if (!response.ok) {
			const error = `Telegram API request failed with status ${response.status}.`;

			console.error(`[contact/telegram] ${error}`);

			return {
				success: false,
				error,
			};
		}

		const result = (await response.json()) as TelegramResponse;

		if (!result.ok) {
			const error = result.description ?? 'Telegram API returned an unsuccessful response.';

			console.error(`[contact/telegram] ${error}`);

			return {
				success: false,
				error,
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			const abortError = 'Telegram request timed out.';

			console.error(`[contact/telegram] ${abortError}`);

			return {
				success: false,
				error: abortError,
			};
		}

		console.error('[contact/telegram] Telegram request failed.', error);

		return {
			success: false,
			error: 'Telegram request failed.',
		};
	} finally {
		clearTimeout(timeout);
	}
}
