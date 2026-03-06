import { NextResponse, userAgent } from 'next/server';
import { z } from 'zod';

import { getGeoInfo } from '@/shared/lib/geo';
import { sendContactTelegramMessage } from '@/shared/lib/telegram';
import { contactSchema } from '@/shared/lib/validation';

const MAX_SCREEN_DIMENSION = 20_000;
const MAX_PIXEL_RATIO = 20;
const MAX_FILL_SPEED_MS = 86_400_000;
const MAX_CONTEXT_LENGTH = 2048;
const MAX_LANGUAGE_LENGTH = 64;
const MAX_PLATFORM_LENGTH = 64;
const MAX_PLATFORM_VERSION_LENGTH = 64;
const MAX_DEVICE_TYPE_LENGTH = 64;
const MAX_CONNECTION_TYPE_LENGTH = 64;
const MAX_UTM_VALUE_LENGTH = 256;
const MAX_SESSION_ID_LENGTH = 128;
const MAX_VISITOR_ID_LENGTH = 128;
const MAX_NETWORK_LATENCY_MS = 120_000;
const MAX_DEVICE_MEMORY_GB = 1024;
const MAX_CPU_CORES = 256;
const WINDOWS_11_PLATFORM_VERSION_MAJOR = 13;

const screenSchema = z.object({
	width: z.number().int().min(0).max(MAX_SCREEN_DIMENSION),
	height: z.number().int().min(0).max(MAX_SCREEN_DIMENSION),
	viewportWidth: z.number().int().min(0).max(MAX_SCREEN_DIMENSION),
	viewportHeight: z.number().int().min(0).max(MAX_SCREEN_DIMENSION),
	pixelRatio: z.number().min(0).max(MAX_PIXEL_RATIO),
});

const utmTagsSchema = z.object({
	source: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	medium: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	campaign: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	term: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	content: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	id: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
});

const contactRequestSchema = contactSchema.extend({
	pageUrl: z.string().trim().pipe(z.url()).optional(),
	clientContext: z
		.object({
			referrer: z.string().trim().max(MAX_CONTEXT_LENGTH).optional(),
			language: z.string().trim().max(MAX_LANGUAGE_LENGTH).optional(),
			platform: z.string().trim().max(MAX_PLATFORM_LENGTH).optional(),
			platformVersion: z.string().trim().max(MAX_PLATFORM_VERSION_LENGTH).optional(),
			deviceType: z.string().trim().max(MAX_DEVICE_TYPE_LENGTH).optional(),
			connectionType: z.string().trim().max(MAX_CONNECTION_TYPE_LENGTH).optional(),
			utmTags: utmTagsSchema.optional(),
			screen: screenSchema.optional(),
		})
		.optional(),
	metrics: z
		.object({
			fillSpeedMs: z.number().int().min(0).max(MAX_FILL_SPEED_MS).optional(),
			sessionId: z.string().trim().max(MAX_SESSION_ID_LENGTH).optional(),
			visitorId: z.string().trim().max(MAX_VISITOR_ID_LENGTH).optional(),
			networkLatencyMs: z.number().min(0).max(MAX_NETWORK_LATENCY_MS).optional(),
			deviceMemoryGb: z.number().min(0).max(MAX_DEVICE_MEMORY_GB).optional(),
			cpuCores: z.number().int().min(1).max(MAX_CPU_CORES).optional(),
		})
		.optional(),
});

type ContactRequestPayload = z.output<typeof contactRequestSchema>;
type ContactClientScreen = z.output<typeof screenSchema>;
type ContactUtmTags = z.output<typeof utmTagsSchema>;
type ContactClientContext = NonNullable<ContactRequestPayload['clientContext']>;
type ContactRequestFieldErrors = Partial<Record<keyof ContactRequestPayload, string[]>>;
type ContactTelegramMetadata = Parameters<typeof sendContactTelegramMessage>[1];
type ContactTelegramPayload = Parameters<typeof sendContactTelegramMessage>[0];

type ContactApiSuccess = {
	success: true;
};

type ContactApiError = {
	success: false;
	error: string;
	issues?: ContactRequestFieldErrors;
};

async function parseBody(request: Request): Promise<unknown | null> {
	try {
		return await request.json();
	} catch {
		return null;
	}
}

function normalizeOptionalString(value?: string | null) {
	const trimmedValue = value?.trim();

	return trimmedValue && trimmedValue.length > 0 ? trimmedValue : undefined;
}

function resolveHeaderValue(request: Request, headerNames: string[]) {
	let resolvedHeaderValue: string | undefined;

	for (const headerName of headerNames) {
		const headerValue = normalizeOptionalString(request.headers.get(headerName));

		if (headerValue) {
			resolvedHeaderValue = headerValue;
			break;
		}
	}

	return resolvedHeaderValue;
}

function resolveClientIp(request: Request) {
	const forwardedForValue = resolveHeaderValue(request, ['x-forwarded-for']);

	if (forwardedForValue) {
		const [firstForwardedIp] = forwardedForValue.split(',');
		const normalizedForwardedIp = normalizeOptionalString(firstForwardedIp);

		if (normalizedForwardedIp) {
			return normalizedForwardedIp;
		}
	}

	return resolveHeaderValue(request, ['x-real-ip', 'cf-connecting-ip']);
}

function resolvePageUrl(request: Request, pageUrl?: string) {
	return (
		normalizeOptionalString(pageUrl) ??
		resolveHeaderValue(request, ['referer', 'origin']) ??
		'unknown'
	);
}

function resolveReferrer(request: Request, referrer?: string) {
	return normalizeOptionalString(referrer) ?? resolveHeaderValue(request, ['referer']);
}

function resolveLanguage(language: string | undefined, request: Request) {
	const normalizedLanguage = normalizeOptionalString(language);

	if (normalizedLanguage) {
		return normalizedLanguage;
	}

	const acceptLanguage = request.headers.get('accept-language');
	const primaryAcceptedLanguage = acceptLanguage?.split(',')[0];

	return normalizeOptionalString(primaryAcceptedLanguage);
}

function resolveOperatingSystem(
	osName?: string,
	osVersion?: string,
	clientContext?: ContactClientContext
) {
	const defaultResolvedOs = formatUserAgentPart(osName, osVersion);
	const platform = normalizeOptionalString(clientContext?.platform);
	const platformVersion = normalizeOptionalString(clientContext?.platformVersion);

	if (platform?.toLowerCase() === 'windows' && platformVersion) {
		const [majorPart] = platformVersion.split('.');
		const majorVersion = Number.parseInt(majorPart ?? '', 10);

		if (Number.isFinite(majorVersion) && majorVersion >= WINDOWS_11_PLATFORM_VERSION_MAJOR) {
			return 'Windows 11';
		}
	}

	return defaultResolvedOs ?? platform;
}

function resolveDeviceType(deviceType?: string, serverDeviceType?: string) {
	return normalizeOptionalString(deviceType) ?? normalizeOptionalString(serverDeviceType);
}

function formatUserAgentPart(name?: string, version?: string) {
	const normalizedName = normalizeOptionalString(name);
	const normalizedVersion = normalizeOptionalString(version);

	return normalizedName
		? normalizedVersion
			? `${normalizedName} ${normalizedVersion}`
			: normalizedName
		: undefined;
}

function formatScreenInfo(screen?: ContactClientScreen) {
	return screen
		? `${screen.width}x${screen.height} (viewport ${screen.viewportWidth}x${screen.viewportHeight}, DPR ${screen.pixelRatio})`
		: undefined;
}

async function resolveGeoFromService(ip?: string) {
	return getGeoInfo({ ip });
}

function resolveUtmTags(utmTags?: ContactUtmTags) {
	const source = normalizeOptionalString(utmTags?.source);
	const medium = normalizeOptionalString(utmTags?.medium);
	const campaign = normalizeOptionalString(utmTags?.campaign);
	const term = normalizeOptionalString(utmTags?.term);
	const content = normalizeOptionalString(utmTags?.content);
	const id = normalizeOptionalString(utmTags?.id);

	return source || medium || campaign || term || content || id
		? {
				source,
				medium,
				campaign,
				term,
				content,
				id,
			}
		: null;
}

async function enrichContactMetadata(
	request: Request,
	payload: ContactRequestPayload
): Promise<ContactTelegramMetadata> {
	const requestUserAgent = userAgent(request);
	const clientIp = resolveClientIp(request);
	const resolvedUtmTags = resolveUtmTags(payload.clientContext?.utmTags);
	const geoFromHeaders = {
		countryCode: resolveHeaderValue(request, ['x-vercel-ip-country', 'cf-ipcountry']),
		city: resolveHeaderValue(request, ['x-vercel-ip-city', 'cf-ipcity']),
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
			city: geoFromHeaders.city ?? geoFromService?.city,
			timezone: geoFromHeaders.timezone ?? geoFromService?.timezone,
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
		context: {
			pageUrl: resolvePageUrl(request, payload.pageUrl),
			referrer: resolveReferrer(request, payload.clientContext?.referrer),
			...(resolvedUtmTags ? { utmTags: resolvedUtmTags } : {}),
		},
		business: {
			submittedAt: new Date(),
			fillSpeedMs: payload.metrics?.fillSpeedMs,
			sessionId: normalizeOptionalString(payload.metrics?.sessionId),
			visitorId: normalizeOptionalString(payload.metrics?.visitorId),
			networkLatencyMs: payload.metrics?.networkLatencyMs,
			deviceMemoryGb: payload.metrics?.deviceMemoryGb,
			cpuCores: payload.metrics?.cpuCores,
		},
	};
}

function toContactTelegramPayload(payload: ContactRequestPayload): ContactTelegramPayload {
	return {
		name: payload.name,
		email: payload.email,
		telegram: payload.telegram,
		message: payload.message,
	};
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
