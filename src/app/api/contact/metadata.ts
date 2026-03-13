import { userAgent } from 'next/server';

import { getGeoInfo } from '@/shared/lib/geo';

import {
	formatScreenInfo,
	formatUserAgentPart,
	normalizeOptionalString,
	resolveClientIp,
	resolveDeviceType,
	resolveHeaderValue,
	resolveLanguage,
	resolveOperatingSystem,
} from './resolvers';
import type { ContactRequestPayload, ContactTelegramMetadata } from './schema';

export async function resolveGeoFromService(ip?: string) {
	return getGeoInfo({ ip });
}

export async function enrichContactMetadata(
	request: Request,
	payload: ContactRequestPayload
): Promise<ContactTelegramMetadata> {
	const requestUserAgent = userAgent(request);
	const clientIp = resolveClientIp(request);
	const geoFromHeaders = {
		countryCode: resolveHeaderValue(request, ['x-vercel-ip-country', 'cf-ipcountry']),
		timezone: resolveHeaderValue(request, ['x-vercel-ip-timezone', 'cf-timezone']),
	};
	const geoFromService = await resolveGeoFromService(clientIp);

	return {
		geo: {
			ip: clientIp ?? geoFromService?.ip,
			asn: geoFromService?.asn,
			asName: geoFromService?.asName,
			asDomain: geoFromService?.asDomain,
			countryCode: geoFromHeaders.countryCode ?? geoFromService?.countryCode,
			country: geoFromService?.country ?? geoFromHeaders.countryCode,
			continentCode: geoFromService?.continentCode,
			continent: geoFromService?.continent,
			timezone:
				normalizeOptionalString(payload.clientContext?.timezone) ??
				geoFromHeaders.timezone ??
				geoFromService?.timezone,
		},
		device: {
			browser: formatUserAgentPart(requestUserAgent.browser.name, requestUserAgent.browser.version),
			os: resolveOperatingSystem(
				requestUserAgent.os.name,
				requestUserAgent.os.version,
				payload.clientContext
			),
			deviceType: resolveDeviceType(
				payload.clientContext?.deviceType,
				requestUserAgent.device.type
			),
			connectionType: normalizeOptionalString(payload.clientContext?.connectionType),
			language: resolveLanguage(payload.clientContext?.language, request),
			screen: formatScreenInfo(payload.clientContext?.screen),
		},
		business: {
			submittedAt: new Date(),
			fillSpeedMs: payload.metrics?.fillSpeedMs,
			sessionId: normalizeOptionalString(payload.metrics?.sessionId),
			visitorId: normalizeOptionalString(payload.metrics?.visitorId),
			networkLatencyMs: payload.metrics?.networkLatencyMs,
			deviceMemoryGb: payload.metrics?.deviceMemoryGb,
			cpuCores: payload.metrics?.cpuCores,
			downlinkSpeed: payload.metrics?.downlinkSpeed,
			deviceGpu: normalizeOptionalString(payload.metrics?.deviceGpu),
			colorScheme: payload.metrics?.colorScheme,
			touchSupport: payload.metrics?.touchSupport,
			pageLoadTime: payload.metrics?.pageLoadTime,
		},
	};
}
