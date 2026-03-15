const HTTP_TOO_MANY_REQUESTS_STATUS = 429;
const DEFAULT_RATE_LIMIT_MESSAGE = 'Too many requests.';
const MILLISECONDS_IN_SECOND = 1000;

type RateLimitEntry = {
	count: number;
	resetAt: number;
};

type RateLimitOptions = {
	bucket: string;
	limit: number;
	windowMs: number;
};

type RateLimitResult = { success: true } | { success: false; response: Response };

const globalForRateLimit = globalThis as typeof globalThis & {
	__skeletonHubApiRateLimitStore?: Map<string, RateLimitEntry>;
};

const rateLimitStore = (globalForRateLimit.__skeletonHubApiRateLimitStore ??= new Map<
	string,
	RateLimitEntry
>());

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

	return resolveHeaderValue(request, ['x-real-ip', 'cf-connecting-ip']) ?? 'anonymous';
}

function pruneExpiredEntries(now: number) {
	for (const [key, entry] of rateLimitStore.entries()) {
		if (entry.resetAt <= now) {
			rateLimitStore.delete(key);
		}
	}
}

function createRateLimitResponse(retryAfterSeconds: number): Response {
	return Response.json(
		{
			success: false,
			error: DEFAULT_RATE_LIMIT_MESSAGE,
		},
		{
			status: HTTP_TOO_MANY_REQUESTS_STATUS,
			headers: {
				'Retry-After': String(retryAfterSeconds),
			},
		}
	);
}

export function checkRateLimit(request: Request, options: RateLimitOptions): RateLimitResult {
	const now = Date.now();
	const ipAddress = resolveClientIp(request);
	const key = `${options.bucket}:${ipAddress}`;

	pruneExpiredEntries(now);

	const currentEntry = rateLimitStore.get(key);

	if (!currentEntry || currentEntry.resetAt <= now) {
		rateLimitStore.set(key, {
			count: 1,
			resetAt: now + options.windowMs,
		});

		return { success: true };
	}

	if (currentEntry.count >= options.limit) {
		const retryAfterSeconds = Math.max(
			1,
			Math.ceil((currentEntry.resetAt - now) / MILLISECONDS_IN_SECOND)
		);

		return {
			success: false,
			response: createRateLimitResponse(retryAfterSeconds),
		};
	}

	currentEntry.count += 1;
	rateLimitStore.set(key, currentEntry);

	return { success: true };
}
