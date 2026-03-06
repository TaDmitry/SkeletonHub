import 'server-only';

import type { ContactSchemaValues } from '@/shared/lib/validation/contact.schema';

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org';
const TELEGRAM_REQUEST_TIMEOUT_MS = 10_000;
const FALLBACK_FIELD_VALUE = '-';
const SUBMISSION_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
	dateStyle: 'medium',
	timeStyle: 'medium',
});

type TelegramResponse = {
	ok: boolean;
	description?: string;
};

type SendContactMetadata = {
	pageUrl?: string;
	submittedAt?: Date;
};

type SendContactResult = { success: true } | { success: false; error: string };

function normalizeTelegramUsername(username?: string) {
	if (!username) {
		return FALLBACK_FIELD_VALUE;
	}

	return username.startsWith('@') ? username : `@${username}`;
}

function resolveContactInfo({ email, telegram }: Pick<ContactSchemaValues, 'email' | 'telegram'>) {
	const normalizedTelegram = normalizeTelegramUsername(telegram);

	if (normalizedTelegram === FALLBACK_FIELD_VALUE) {
		return email;
	}

	return `${email} | ${normalizedTelegram}`;
}

function formatSubmissionDate(date: Date) {
	return SUBMISSION_DATE_FORMATTER.format(date);
}

function buildContactTelegramMessage(
	{ name, message, ...rest }: ContactSchemaValues,
	{ pageUrl, submittedAt }: Required<SendContactMetadata>
) {
	const lines = [
		'📩 Новая заявка с веб-сайта',
		'',
		`👤 Имя: ${name}`,
		`📬 Контакт: ${resolveContactInfo(rest)}`,
		`📝 Сообщение: ${message}`,
		`🕒 Дата: ${formatSubmissionDate(submittedAt)}`,
		`🌍 Страница: ${pageUrl}`,
	];

	return lines.join('\n');
}

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

	const requestMetadata = {
		pageUrl: metadata.pageUrl ?? FALLBACK_FIELD_VALUE,
		submittedAt: metadata.submittedAt ?? new Date(),
	} satisfies Required<SendContactMetadata>;

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
