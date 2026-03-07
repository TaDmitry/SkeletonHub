import type { ContactSchemaValues } from '@/shared/lib/validation';

import type { ContactApiPayload } from '../model/types';

type ClientMetricsInput = {
	firstInteractionStartedAt: number | null;
	networkLatencyMs: number | null;
	deviceMemoryGb: number | null;
	cpuCores: number | null;
	downlinkSpeed: number | null;
	deviceGpu: string | null;
	colorScheme: 'light' | 'dark' | null;
	touchSupport: boolean | null;
	pageLoadTime: number | null;
	sessionId: string | null;
	visitorId: string | null;
};

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

function resolveDownlinkSpeed() {
	if (typeof navigator === 'undefined') {
		return null;
	}

	const navigationWithConnection = navigator as Navigator & {
		connection?: {
			downlink?: number;
			saveData?: boolean;
		};
		mozConnection?: { downlink?: number };
		webkitConnection?: { downlink?: number };
	};

	const connection =
		navigationWithConnection.connection ??
		navigationWithConnection.mozConnection ??
		navigationWithConnection.webkitConnection;

	if (!connection || typeof connection.downlink !== 'number') {
		return null;
	}

	return Number.isFinite(connection.downlink) && connection.downlink >= 0
		? connection.downlink
		: null;
}

function resolveDeviceGpu() {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

		if (!gl) {
			return null;
		}

		const debugInfo = (gl as unknown as { getExtension: (name: string) => unknown }).getExtension(
			'WEBGL_debug_renderer_info'
		);

		if (!debugInfo) {
			return null;
		}

		const gpu = (gl as unknown as { getParameter: (param: unknown) => unknown }).getParameter(
			(debugInfo as unknown as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL
		);

		return typeof gpu === 'string' && gpu.length > 0 ? gpu : null;
	} catch {
		return null;
	}
}

function resolveColorScheme(): 'light' | 'dark' | null {
	if (typeof window === 'undefined') {
		return null;
	}

	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

	if (!prefersDark.matches) {
		const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

		return prefersLight.matches ? 'light' : null;
	}

	return 'dark';
}

function resolveTouchSupport() {
	if (typeof navigator === 'undefined') {
		return null;
	}

	const maxTouchPoints =
		(navigator as Navigator & { maxTouchPoints?: number; msMaxTouchPoints?: number })
			.maxTouchPoints ?? (navigator as Navigator & { msMaxTouchPoints?: number }).msMaxTouchPoints;

	return typeof maxTouchPoints === 'number' && maxTouchPoints > 0;
}

function resolvePageLoadTime() {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const navigationEntries = performance.getEntriesByType('navigation');

		if (navigationEntries.length === 0) {
			return null;
		}

		const navigationTiming = navigationEntries[0] as PerformanceNavigationTiming;

		if (!navigationTiming.loadEventEnd || navigationTiming.loadEventEnd === 0) {
			return null;
		}

		if (!navigationTiming.fetchStart || navigationTiming.fetchStart === 0) {
			return null;
		}

		const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;

		return loadTime > 0 ? Math.round(loadTime) : null;
	} catch {
		return null;
	}
}

function resolveTimezone() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
	} catch {
		return null;
	}
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

function resolveClientMetrics(input: ClientMetricsInput) {
	const fillSpeedMs =
		input.firstInteractionStartedAt === null
			? undefined
			: Math.max(0, Date.now() - input.firstInteractionStartedAt);

	const metrics = {
		...(typeof fillSpeedMs === 'number' ? { fillSpeedMs } : {}),
		...(input.sessionId ? { sessionId: input.sessionId } : {}),
		...(input.visitorId ? { visitorId: input.visitorId } : {}),
		...(typeof input.networkLatencyMs === 'number'
			? { networkLatencyMs: input.networkLatencyMs }
			: {}),
		...(typeof input.deviceMemoryGb === 'number' ? { deviceMemoryGb: input.deviceMemoryGb } : {}),
		...(typeof input.cpuCores === 'number' ? { cpuCores: input.cpuCores } : {}),
		...(typeof input.downlinkSpeed === 'number' ? { downlinkSpeed: input.downlinkSpeed } : {}),
		...(input.deviceGpu ? { deviceGpu: input.deviceGpu } : {}),
		...(input.colorScheme ? { colorScheme: input.colorScheme } : {}),
		...(typeof input.touchSupport === 'boolean' ? { touchSupport: input.touchSupport } : {}),
		...(typeof input.pageLoadTime === 'number' ? { pageLoadTime: input.pageLoadTime } : {}),
	};

	return Object.keys(metrics).length > 0 ? metrics : undefined;
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
	const downlinkSpeed = resolveDownlinkSpeed();
	const deviceGpu = resolveDeviceGpu();
	const colorScheme = resolveColorScheme();
	const touchSupport = resolveTouchSupport();
	const pageLoadTime = resolvePageLoadTime();
	const timezone = resolveTimezone();
	const utmTags = resolveUtmTags(currentPageUrl);
	const screenContext = resolveScreenContext();
	const metrics = resolveClientMetrics({
		firstInteractionStartedAt,
		networkLatencyMs,
		deviceMemoryGb,
		cpuCores,
		downlinkSpeed,
		deviceGpu,
		colorScheme,
		touchSupport,
		pageLoadTime,
		sessionId,
		visitorId,
	});

	return {
		...values,
		...(currentPageUrl ? { pageUrl: currentPageUrl } : {}),
		clientContext: {
			...(currentReferrer ? { referrer: currentReferrer } : {}),
			...(currentLanguage ? { language: currentLanguage } : {}),
			...(timezone ? { timezone } : {}),
			...(platformContext ?? {}),
			...(deviceType ? { deviceType } : {}),
			...(connectionType ? { connectionType } : {}),
			...(utmTags ? { utmTags } : {}),
			...(screenContext ? { screen: screenContext } : {}),
		},
		...(metrics ? { metrics } : {}),
	};
}
