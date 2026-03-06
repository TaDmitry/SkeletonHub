import type { ContactSchemaValues } from '@/shared/lib/validation';

import type { ContactApiPayload } from '../model/types';

type UserAgentDataLike = {
	platform?: string;
	mobile?: boolean;
	getHighEntropyValues?: (hints: string[]) => Promise<{ platformVersion?: string }>;
};

type NetworkInformationLike = {
	type?: string;
	effectiveType?: string;
	rtt?: number;
};

const CONTACT_SESSION_ID_STORAGE_KEY = 'contactForm.sessionId';
const CONTACT_VISITOR_ID_STORAGE_KEY = 'contactForm.visitorId';
const RADIX_BASE_36 = 36;
const RANDOM_ID_SLICE_START = 2;
const RANDOM_ID_SLICE_END = 12;

function resolveUserAgentData() {
	if (typeof navigator === 'undefined') {
		return null;
	}

	const maybeUserAgentData = (
		navigator as Navigator & {
			userAgentData?: UserAgentDataLike;
		}
	).userAgentData;

	return maybeUserAgentData ?? null;
}

async function resolveClientPlatformContext(userAgentData: UserAgentDataLike | null) {
	if (!userAgentData) {
		return null;
	}

	const platform = typeof userAgentData.platform === 'string' ? userAgentData.platform : undefined;
	let platformVersion: string | undefined;

	if (typeof userAgentData.getHighEntropyValues === 'function') {
		try {
			const values = await userAgentData.getHighEntropyValues(['platformVersion']);
			const resolvedPlatformVersion = values.platformVersion;

			if (typeof resolvedPlatformVersion === 'string' && resolvedPlatformVersion.length > 0) {
				platformVersion = resolvedPlatformVersion;
			}
		} catch {
			platformVersion = undefined;
		}
	}

	if (!platform && !platformVersion) {
		return null;
	}

	return {
		...(platform ? { platform } : {}),
		...(platformVersion ? { platformVersion } : {}),
	};
}

function resolveDeviceType(userAgentData: UserAgentDataLike | null) {
	if (userAgentData?.mobile === true) {
		return 'mobile';
	}

	if (typeof navigator === 'undefined') {
		return null;
	}

	const userAgent = navigator.userAgent.toLowerCase();

	if (/ipad|tablet/.test(userAgent)) {
		return 'tablet';
	}

	if (/mobile|iphone|android/.test(userAgent)) {
		return 'mobile';
	}

	if (/bot|crawler|spider/.test(userAgent)) {
		return 'bot';
	}

	return 'desktop';
}

function resolveNetworkInformation() {
	if (typeof navigator === 'undefined') {
		return null;
	}

	const navigationWithConnection = navigator as Navigator & {
		connection?: NetworkInformationLike;
		mozConnection?: NetworkInformationLike;
		webkitConnection?: NetworkInformationLike;
	};

	return (
		navigationWithConnection.connection ??
		navigationWithConnection.mozConnection ??
		navigationWithConnection.webkitConnection ??
		null
	);
}

function resolveConnectionType(connection: NetworkInformationLike | null) {
	if (!connection) {
		return null;
	}

	const type = typeof connection.type === 'string' ? connection.type : undefined;
	const effectiveType =
		typeof connection.effectiveType === 'string' ? connection.effectiveType : undefined;

	if (type && effectiveType) {
		return `${type}/${effectiveType}`;
	}

	return type ?? effectiveType ?? null;
}

function resolveNetworkLatencyMs(connection: NetworkInformationLike | null) {
	if (!connection) {
		return null;
	}

	const { rtt } = connection;

	return typeof rtt === 'number' && Number.isFinite(rtt) && rtt >= 0 ? rtt : null;
}

function generateClientIdentifier() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	return `${Date.now().toString(RADIX_BASE_36)}-${Math.random()
		.toString(RADIX_BASE_36)
		.slice(RANDOM_ID_SLICE_START, RANDOM_ID_SLICE_END)}`;
}

function resolveStorageBackedIdentifier(storageType: 'session' | 'local', storageKey: string) {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const storage = storageType === 'session' ? window.sessionStorage : window.localStorage;
		const storedValue = storage.getItem(storageKey);

		if (storedValue && storedValue.trim().length > 0) {
			return storedValue;
		}

		const generatedValue = generateClientIdentifier();
		storage.setItem(storageKey, generatedValue);

		return generatedValue;
	} catch {
		return null;
	}
}

function resolveSessionId() {
	return resolveStorageBackedIdentifier('session', CONTACT_SESSION_ID_STORAGE_KEY);
}

function resolveVisitorId() {
	return resolveStorageBackedIdentifier('local', CONTACT_VISITOR_ID_STORAGE_KEY);
}

function resolveDeviceMemoryGb() {
	if (typeof navigator === 'undefined') {
		return null;
	}

	const { deviceMemory } = navigator as Navigator & { deviceMemory?: number };

	return typeof deviceMemory === 'number' && Number.isFinite(deviceMemory) && deviceMemory > 0
		? deviceMemory
		: null;
}

function resolveCpuCores() {
	if (typeof navigator === 'undefined') {
		return null;
	}

	const cpuCores = navigator.hardwareConcurrency;

	return typeof cpuCores === 'number' && Number.isFinite(cpuCores) && cpuCores > 0
		? cpuCores
		: null;
}

function resolveUtmTags(pageUrl: string | null) {
	if (!pageUrl) {
		return null;
	}

	try {
		const search = new URL(pageUrl).searchParams;
		const source = search.get('utm_source');
		const medium = search.get('utm_medium');
		const campaign = search.get('utm_campaign');
		const term = search.get('utm_term');
		const content = search.get('utm_content');
		const id = search.get('utm_id');

		if (!source && !medium && !campaign && !term && !content && !id) {
			return null;
		}

		return {
			...(source ? { source } : {}),
			...(medium ? { medium } : {}),
			...(campaign ? { campaign } : {}),
			...(term ? { term } : {}),
			...(content ? { content } : {}),
			...(id ? { id } : {}),
		};
	} catch {
		return null;
	}
}

function resolveScreenContext() {
	if (typeof window === 'undefined') {
		return null;
	}

	return {
		width: window.screen.width,
		height: window.screen.height,
		viewportWidth: window.innerWidth,
		viewportHeight: window.innerHeight,
		pixelRatio: window.devicePixelRatio,
	};
}

export async function createContactApiPayload(
	values: ContactSchemaValues,
	firstInteractionStartedAt: number | null
): Promise<ContactApiPayload> {
	const currentPageUrl = typeof window === 'undefined' ? null : window.location.href;
	const currentReferrer = typeof document === 'undefined' ? null : document.referrer;
	const currentLanguage = typeof navigator === 'undefined' ? null : navigator.language;
	const userAgentData = resolveUserAgentData();
	const platformContext = await resolveClientPlatformContext(userAgentData);
	const deviceType = resolveDeviceType(userAgentData);
	const networkInformation = resolveNetworkInformation();
	const connectionType = resolveConnectionType(networkInformation);
	const networkLatencyMs = resolveNetworkLatencyMs(networkInformation);
	const sessionId = resolveSessionId();
	const visitorId = resolveVisitorId();
	const deviceMemoryGb = resolveDeviceMemoryGb();
	const cpuCores = resolveCpuCores();
	const utmTags = resolveUtmTags(currentPageUrl);
	const screenContext = resolveScreenContext();
	const fillSpeedMs =
		firstInteractionStartedAt === null
			? undefined
			: Math.max(0, Date.now() - firstInteractionStartedAt);
	const metrics = {
		...(typeof fillSpeedMs === 'number' ? { fillSpeedMs } : {}),
		...(sessionId ? { sessionId } : {}),
		...(visitorId ? { visitorId } : {}),
		...(typeof networkLatencyMs === 'number' ? { networkLatencyMs } : {}),
		...(typeof deviceMemoryGb === 'number' ? { deviceMemoryGb } : {}),
		...(typeof cpuCores === 'number' ? { cpuCores } : {}),
	};

	return {
		...values,
		...(currentPageUrl ? { pageUrl: currentPageUrl } : {}),
		clientContext: {
			...(currentReferrer ? { referrer: currentReferrer } : {}),
			...(currentLanguage ? { language: currentLanguage } : {}),
			...(platformContext ?? {}),
			...(deviceType ? { deviceType } : {}),
			...(connectionType ? { connectionType } : {}),
			...(utmTags ? { utmTags } : {}),
			...(screenContext ? { screen: screenContext } : {}),
		},
		...(Object.keys(metrics).length > 0 ? { metrics } : {}),
	};
}
