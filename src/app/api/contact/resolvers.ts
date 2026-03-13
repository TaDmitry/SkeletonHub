import type {
	ContactClientContext,
	ContactClientScreen,
	ContactRequestPayload,
	ContactTelegramPayload,
	ContactUtmTags,
} from './schema';

//* Вспомогательные утилиты
export function normalizeOptionalString(value?: string | null) {
	const trimmedValue = value?.trim();

	return trimmedValue && trimmedValue.length > 0 ? trimmedValue : undefined;
}

export function resolveHeaderValue(request: Request, headerNames: string[]) {
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

//* Синтаксический анализ тела
export async function parseBody(request: Request): Promise<unknown | null> {
	try {
		return await request.json();
	} catch {
		return null;
	}
}

//* Разрешение IP клиента
export function resolveClientIp(request: Request) {
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

//* Разрешение языка
export function resolveLanguage(language: string | undefined, request: Request) {
	const normalizedLanguage = normalizeOptionalString(language);

	if (normalizedLanguage) {
		return normalizedLanguage;
	}

	const acceptLanguage = request.headers.get('accept-language');
	const primaryAcceptedLanguage = acceptLanguage?.split(',')[0];

	return normalizeOptionalString(primaryAcceptedLanguage);
}

//* Разрешение операционной системы
const WINDOWS_11_PLATFORM_VERSION_MAJOR = 13;

export function resolveOperatingSystem(
	osName?: string,
	osVersion?: string,
	clientContext?: ContactClientContext
) {
	const osNameOnly = normalizeOptionalString(osName);
	const platform = normalizeOptionalString(clientContext?.platform);
	const platformVersion = normalizeOptionalString(clientContext?.platformVersion);

	if (platform?.toLowerCase() === 'windows' && platformVersion) {
		const [majorPart] = platformVersion.split('.');
		const majorVersion = Number.parseInt(majorPart ?? '', 10);

		if (Number.isFinite(majorVersion) && majorVersion >= WINDOWS_11_PLATFORM_VERSION_MAJOR) {
			return 'Windows 11';
		}

		return platform;
	}

	return osNameOnly ?? platform;
}

//* Разрешение для типа устройства
export function resolveDeviceType(deviceType?: string, serverDeviceType?: string) {
	return normalizeOptionalString(deviceType) ?? normalizeOptionalString(serverDeviceType);
}

//* Утилиты для форматирования
export function formatUserAgentPart(name?: string, version?: string) {
	const normalizedName = normalizeOptionalString(name);
	const normalizedVersion = normalizeOptionalString(version);

	return normalizedName
		? normalizedVersion
			? `${normalizedName} ${normalizedVersion}`
			: normalizedName
		: undefined;
}

export function formatScreenInfo(screen?: ContactClientScreen) {
	return screen
		? `${screen.width}x${screen.height} (viewport ${screen.viewportWidth}x${screen.viewportHeight}, DPR ${screen.pixelRatio})`
		: undefined;
}

//* Разрешение UTM-тегов
export function resolveUtmTags(utmTags?: ContactUtmTags) {
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

//* Преобразование полезной нагрузки
export function toContactTelegramPayload(payload: ContactRequestPayload): ContactTelegramPayload {
	return {
		name: payload.name,
		email: payload.email,
		telegram: payload.telegram,
		message: payload.message,
	};
}
