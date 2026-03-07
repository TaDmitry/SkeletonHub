import type { ContactSchemaValues } from '@/shared/lib/validation';

import {
	formatColorScheme,
	formatCpuCores,
	formatDeviceMemory,
	formatDownlinkSpeed,
	formatFillSpeed,
	formatNetworkLatency,
	formatPageLoadTime,
	formatSubmissionDate,
	formatTouchSupport,
	normalizeMetadataValue,
} from './formatters';
import type { ResolvedSendContactMetadata, SendContactMetadata } from './types';

const FALLBACK_FIELD_VALUE = '-';

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

export function resolveRequestMetadata(metadata: SendContactMetadata): ResolvedSendContactMetadata {
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
			downlinkSpeed: metadata.business?.downlinkSpeed,
			deviceGpu: normalizeMetadataValue(metadata.business?.deviceGpu),
			colorScheme: metadata.business?.colorScheme,
			touchSupport: metadata.business?.touchSupport,
			pageLoadTime: metadata.business?.pageLoadTime,
		},
	};
}

export function buildContactTelegramMessage(
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
		`Timezone: ${geo.timezone}`,
		'',
		'💻 Device',
		`Browser: ${device.browser}`,
		`OS: ${device.os}`,
		`Device type: ${device.deviceType}`,
		`Connection type: ${device.connectionType}`,
		`Language: ${device.language}`,
		`Screen: ${device.screen}`,
		`GPU: ${normalizeMetadataValue(business.deviceGpu)}`,
		`Color scheme: ${formatColorScheme(business.colorScheme)}`,
		`Touch support: ${formatTouchSupport(business.touchSupport)}`,
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
		`Downlink speed: ${formatDownlinkSpeed(business.downlinkSpeed)}`,
		`Page load time: ${formatPageLoadTime(business.pageLoadTime)}`,
	];

	return lines.join('\n');
}
