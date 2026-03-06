import 'server-only';

import { z } from 'zod';

const DEFAULT_GEO_LOOKUP_TIMEOUT_MS = 3_000;
const IPINFO_API_BASE_URL = 'https://api.ipinfo.io/lite';
const IPAPI_API_BASE_URL = 'https://ipapi.co';
const CONTINENT_NAME_BY_CODE = {
	AF: 'Africa',
	AN: 'Antarctica',
	AS: 'Asia',
	EU: 'Europe',
	NA: 'North America',
	OC: 'Oceania',
	SA: 'South America',
} as const;

const ipInfoLiteResponseSchema = z.object({
	ip: z.string().optional(),
	asn: z.string().optional(),
	as_name: z.string().optional(),
	as_domain: z.string().optional(),
	city: z.string().optional(),
	country_code: z.string().optional(),
	country: z.string().optional(),
	continent_code: z.string().optional(),
	continent: z.string().optional(),
	timezone: z.string().optional(),
});

const ipApiResponseSchema = z.object({
	ip: z.string().optional(),
	asn: z.string().optional(),
	org: z.string().optional(),
	city: z.string().optional(),
	country_code: z.string().optional(),
	country_name: z.string().optional(),
	country: z.string().optional(),
	continent_code: z.string().optional(),
	timezone: z.string().optional(),
});

export type GeoInfo = {
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
	provider?: 'ipinfo' | 'ipapi';
};

type GetGeoInfoParams = {
	ip?: string;
	timeoutMs?: number;
};

function normalizeOptionalString(value?: string | null) {
	const trimmedValue = value?.trim();

	return trimmedValue && trimmedValue.length > 0 ? trimmedValue : undefined;
}

function hasGeoPayload(geoInfo: GeoInfo | null): geoInfo is GeoInfo {
	if (!geoInfo) {
		return false;
	}

	return Boolean(
		geoInfo.ip ||
		geoInfo.asn ||
		geoInfo.countryCode ||
		geoInfo.country ||
		geoInfo.continentCode ||
		geoInfo.continent ||
		geoInfo.city ||
		geoInfo.timezone
	);
}

function resolveContinentNameByCode(continentCode?: string) {
	const normalizedCode = continentCode?.toUpperCase() as
		| keyof typeof CONTINENT_NAME_BY_CODE
		| undefined;

	return normalizedCode && CONTINENT_NAME_BY_CODE[normalizedCode];
}

function isLocalAddress(ip: string) {
	return (
		ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.0.0.1') || ip === 'localhost'
	);
}

async function fetchWithTimeout(requestUrl: string, timeoutMs: number) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(requestUrl, {
			method: 'GET',
			cache: 'no-store',
			signal: controller.signal,
		});

		if (!response.ok) {
			return null;
		}

		return response.json();
	} catch (error) {
		if (!(error instanceof Error && error.name === 'AbortError')) {
			console.warn('[geo] Geo lookup request failed.', error);
		}

		return null;
	} finally {
		clearTimeout(timeout);
	}
}

async function resolveGeoFromIpInfo(ip: string, timeoutMs: number): Promise<GeoInfo | null> {
	const token = process.env.IPINFO_TOKEN;

	if (!token) {
		return null;
	}

	const requestUrl = `${IPINFO_API_BASE_URL}/${encodeURIComponent(ip)}?token=${encodeURIComponent(token)}`;
	const responsePayload = await fetchWithTimeout(requestUrl, timeoutMs);

	if (!responsePayload) {
		return null;
	}

	const parsedPayload = ipInfoLiteResponseSchema.safeParse(responsePayload);

	if (!parsedPayload.success) {
		return null;
	}

	const asn = normalizeOptionalString(parsedPayload.data.asn);
	const resolvedIp = normalizeOptionalString(parsedPayload.data.ip);
	const asName = normalizeOptionalString(parsedPayload.data.as_name);
	const asDomain = normalizeOptionalString(parsedPayload.data.as_domain);
	const countryCode = normalizeOptionalString(parsedPayload.data.country_code);
	const country = normalizeOptionalString(
		parsedPayload.data.country ?? parsedPayload.data.country_code
	);
	const continentCode = normalizeOptionalString(parsedPayload.data.continent_code);
	const continent =
		normalizeOptionalString(parsedPayload.data.continent) ??
		resolveContinentNameByCode(continentCode);
	const city = normalizeOptionalString(parsedPayload.data.city);
	const timezone = normalizeOptionalString(parsedPayload.data.timezone);

	return {
		ip: resolvedIp ?? ip,
		asn,
		asName,
		asDomain,
		countryCode,
		country,
		continentCode,
		continent,
		city,
		timezone,
		provider: 'ipinfo',
	};
}

async function resolveGeoFromIpApi(ip: string, timeoutMs: number): Promise<GeoInfo | null> {
	const requestUrl = `${IPAPI_API_BASE_URL}/${encodeURIComponent(ip)}/json/`;
	const responsePayload = await fetchWithTimeout(requestUrl, timeoutMs);

	if (!responsePayload) {
		return null;
	}

	const parsedPayload = ipApiResponseSchema.safeParse(responsePayload);

	if (!parsedPayload.success) {
		return null;
	}

	const asn = normalizeOptionalString(parsedPayload.data.asn);
	const resolvedIp = normalizeOptionalString(parsedPayload.data.ip);
	const asName = normalizeOptionalString(parsedPayload.data.org);
	const countryCode = normalizeOptionalString(
		parsedPayload.data.country_code ?? parsedPayload.data.country
	);
	const country = normalizeOptionalString(
		parsedPayload.data.country_name ?? parsedPayload.data.country
	);
	const continentCode = normalizeOptionalString(parsedPayload.data.continent_code);
	const continent = resolveContinentNameByCode(continentCode);
	const city = normalizeOptionalString(parsedPayload.data.city);
	const timezone = normalizeOptionalString(parsedPayload.data.timezone);

	return {
		ip: resolvedIp ?? ip,
		asn,
		asName,
		countryCode,
		country,
		continentCode,
		continent,
		city,
		timezone,
		provider: 'ipapi',
	};
}

export async function getGeoInfo({
	ip,
	timeoutMs = DEFAULT_GEO_LOOKUP_TIMEOUT_MS,
}: GetGeoInfoParams): Promise<GeoInfo | null> {
	const normalizedIp = normalizeOptionalString(ip);

	if (!normalizedIp || isLocalAddress(normalizedIp)) {
		return null;
	}

	const ipInfoGeo = await resolveGeoFromIpInfo(normalizedIp, timeoutMs);

	if (hasGeoPayload(ipInfoGeo)) {
		return ipInfoGeo;
	}

	const ipApiGeo = await resolveGeoFromIpApi(normalizedIp, timeoutMs);

	return hasGeoPayload(ipApiGeo) ? ipApiGeo : null;
}
