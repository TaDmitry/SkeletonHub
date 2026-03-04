import type { ContactSchemaValues } from '@/shared/lib/validation/contact.schema';

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org';
const TELEGRAM_REQUEST_TIMEOUT_MS = 10_000;

type TelegramResponse = {
	ok: boolean;
	description?: string;
};

type SendContactResult = { success: true } | { success: false; error: string };

function normalizeTelegramUsername(username?: string) {
	if (!username) {
		return '-';
	}

	return username.startsWith('@') ? username : `@${username}`;
}

function buildContactTelegramMessage({ name, email, telegram, message }: ContactSchemaValues) {
	const lines = [
		'SkeletonHub: new contact form message',
		'',
		`Name: ${name}`,
		`Email: ${email}`,
		`Telegram: ${normalizeTelegramUsername(telegram)}`,
		'',
		'Message:',
		message,
	];

	return lines.join('\n');
}

export async function sendContactTelegramMessage(
	payload: ContactSchemaValues
): Promise<SendContactResult> {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	const chatId = process.env.TELEGRAM_CHAT_ID;

	if (!token || !chatId) {
		return {
			success: false,
			error: 'Telegram configuration is missing.',
		};
	}

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
				text: buildContactTelegramMessage(payload),
			}),
		});

		if (!response.ok) {
			return {
				success: false,
				error: `Telegram API request failed with status ${response.status}.`,
			};
		}

		const result = (await response.json()) as TelegramResponse;

		if (!result.ok) {
			return {
				success: false,
				error: result.description ?? 'Telegram API returned an unsuccessful response.',
			};
		}

		return {
			success: true,
		};
	} catch {
		return {
			success: false,
			error: 'Telegram request failed.',
		};
	} finally {
		clearTimeout(timeout);
	}
}
