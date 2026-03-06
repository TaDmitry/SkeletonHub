import 'server-only';

import type { ContactSchemaValues } from '@/shared/lib/validation';

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org';
const TELEGRAM_REQUEST_TIMEOUT_MS = 10_000;
const FALLBACK_FIELD_VALUE = '-';
const MILLISECONDS_IN_SECOND = 1000;
const SUBMISSION_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
	dateStyle: 'medium',
	timeStyle: 'medium',
});

type TelegramResponse = {
	ok: boolean;
	description?: string;
};

type SendContactGeoMetadata = {
	ip?: string;
	asn?: string;
	asName?: string;
	asDomain?: string;
	countryCode?: string;
	country?: string;
	continentCode?: string;
	continent?: string;
	city?: string;
	timezone?: string;
};

type SendContactDeviceMetadata = {
	browser?: string;
	os?: string;
	deviceType?: string;
	connectionType?: string;
	language?: string;
	screen?: string;
};

type SendContactUtmTagsMetadata = {
	source?: string;
	medium?: string;
	campaign?: string;
	term?: string;
	content?: string;
	id?: string;
};

type SendContactContextMetadata = {
	pageUrl?: string;
	referrer?: string;
	utmTags?: SendContactUtmTagsMetadata;
};

type SendContactBusinessMetadata = {
	submittedAt?: Date;
	fillSpeedMs?: number;
	sessionId?: string;
	visitorId?: string;
	networkLatencyMs?: number;
	deviceMemoryGb?: number;
	cpuCores?: number;
};

type SendContactMetadata = {
	// Backward-compatible fields.
	pageUrl?: string;
	submittedAt?: Date;
	geo?: SendContactGeoMetadata;
	device?: SendContactDeviceMetadata;
	context?: SendContactContextMetadata;
	business?: SendContactBusinessMetadata;
};

type ResolvedSendContactMetadata = {
	geo: Required<SendContactGeoMetadata>;
	device: Required<SendContactDeviceMetadata>;
	context: {
		pageUrl: string;
		referrer: string;
		utmTags: Required<SendContactUtmTagsMetadata>;
	};
	business: {
		submittedAt: Date;
		fillSpeedMs?: number;
		sessionId: string;
		visitorId: string;
		networkLatencyMs?: number;
		deviceMemoryGb?: number;
		cpuCores?: number;
	};
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

function formatFillSpeed(fillSpeedMs?: number) {
	if (typeof fillSpeedMs !== 'number' || !Number.isFinite(fillSpeedMs) || fillSpeedMs < 0) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${(fillSpeedMs / MILLISECONDS_IN_SECOND).toFixed(1)} sec`;
}

function formatNetworkLatency(networkLatencyMs?: number) {
	if (
		typeof networkLatencyMs !== 'number' ||
		!Number.isFinite(networkLatencyMs) ||
		networkLatencyMs < 0
	) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${networkLatencyMs.toFixed(0)} ms`;
}

function formatDeviceMemory(deviceMemoryGb?: number) {
	if (
		typeof deviceMemoryGb !== 'number' ||
		!Number.isFinite(deviceMemoryGb) ||
		deviceMemoryGb <= 0
	) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${deviceMemoryGb.toFixed(1)} GB`;
}

function formatCpuCores(cpuCores?: number) {
	if (typeof cpuCores !== 'number' || !Number.isFinite(cpuCores) || cpuCores <= 0) {
		return FALLBACK_FIELD_VALUE;
	}

	return `${cpuCores.toFixed(0)} cores`;
}

function normalizeMetadataValue(value?: string) {
	if (!value) {
		return FALLBACK_FIELD_VALUE;
	}

	const trimmedValue = value.trim();

	return trimmedValue.length > 0 ? trimmedValue : FALLBACK_FIELD_VALUE;
}

function resolveRequestMetadata(metadata: SendContactMetadata): ResolvedSendContactMetadata {
	const submittedAt = metadata.business?.submittedAt ?? metadata.submittedAt ?? new Date();
	const pageUrl = metadata.context?.pageUrl ?? metadata.pageUrl;
	const utmTags = metadata.context?.utmTags;

	return {
		geo: {
			ip: normalizeMetadataValue(metadata.geo?.ip),
			asn: normalizeMetadataValue(metadata.geo?.asn),
			asName: normalizeMetadataValue(metadata.geo?.asName),
			asDomain: normalizeMetadataValue(metadata.geo?.asDomain),
			countryCode: normalizeMetadataValue(metadata.geo?.countryCode),
			country: normalizeMetadataValue(metadata.geo?.country),
			continentCode: normalizeMetadataValue(metadata.geo?.continentCode),
			continent: normalizeMetadataValue(metadata.geo?.continent),
			city: normalizeMetadataValue(metadata.geo?.city),
			timezone: normalizeMetadataValue(metadata.geo?.timezone),
		},
		device: {
			browser: normalizeMetadataValue(metadata.device?.browser),
			os: normalizeMetadataValue(metadata.device?.os),
			deviceType: normalizeMetadataValue(metadata.device?.deviceType),
			connectionType: normalizeMetadataValue(metadata.device?.connectionType),
			language: normalizeMetadataValue(metadata.device?.language),
			screen: normalizeMetadataValue(metadata.device?.screen),
		},
		context: {
			pageUrl: normalizeMetadataValue(pageUrl),
			referrer: normalizeMetadataValue(metadata.context?.referrer),
			utmTags: {
				source: normalizeMetadataValue(utmTags?.source),
				medium: normalizeMetadataValue(utmTags?.medium),
				campaign: normalizeMetadataValue(utmTags?.campaign),
				term: normalizeMetadataValue(utmTags?.term),
				content: normalizeMetadataValue(utmTags?.content),
				id: normalizeMetadataValue(utmTags?.id),
			},
		},
		business: {
			submittedAt,
			fillSpeedMs: metadata.business?.fillSpeedMs,
			sessionId: normalizeMetadataValue(metadata.business?.sessionId),
			visitorId: normalizeMetadataValue(metadata.business?.visitorId),
			networkLatencyMs: metadata.business?.networkLatencyMs,
			deviceMemoryGb: metadata.business?.deviceMemoryGb,
			cpuCores: metadata.business?.cpuCores,
		},
	};
}

function buildContactTelegramMessage(
	{ name, message, ...rest }: ContactSchemaValues,
	metadata: ResolvedSendContactMetadata
) {
	const { geo, device, context, business } = metadata;
	const lines = [
		'📩 New contact request from website',
		'',
		`👤 Name: ${name}`,
		`📬 Contact: ${resolveContactInfo(rest)}`,
		`📝 Message: ${message}`,
		'',
		'🌍 Geo',
		`IP: ${geo.ip}`,
		`ASN: ${geo.asn}`,
		`AS Name: ${geo.asName}`,
		`AS Domain: ${geo.asDomain}`,
		`Country code: ${geo.countryCode}`,
		`Country: ${geo.country}`,
		`Continent code: ${geo.continentCode}`,
		`Continent: ${geo.continent}`,
		`City: ${geo.city}`,
		`Timezone: ${geo.timezone}`,
		'',
		'💻 Device',
		`Browser: ${device.browser}`,
		`OS: ${device.os}`,
		`Device type: ${device.deviceType}`,
		`Connection type: ${device.connectionType}`,
		`Language: ${device.language}`,
		`Screen: ${device.screen}`,
		'',
		'🔎 Context',
		`Page: ${context.pageUrl}`,
		`Referrer: ${context.referrer}`,
		`UTM source: ${context.utmTags.source}`,
		`UTM medium: ${context.utmTags.medium}`,
		`UTM campaign: ${context.utmTags.campaign}`,
		`UTM term: ${context.utmTags.term}`,
		`UTM content: ${context.utmTags.content}`,
		`UTM id: ${context.utmTags.id}`,
		'',
		'📈 Business metrics',
		`Submitted at: ${formatSubmissionDate(business.submittedAt)}`,
		`Fill speed: ${formatFillSpeed(business.fillSpeedMs)}`,
		`Session ID: ${business.sessionId}`,
		`Visitor ID: ${business.visitorId}`,
		`Network latency: ${formatNetworkLatency(business.networkLatencyMs)}`,
		`Device memory: ${formatDeviceMemory(business.deviceMemoryGb)}`,
		`CPU cores: ${formatCpuCores(business.cpuCores)}`,
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
