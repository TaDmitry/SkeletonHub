import { z } from 'zod';

import { sendContactTelegramMessage } from '@/shared/lib/telegram';
import { contactSchema } from '@/shared/lib/validation';

export const MAX_SCREEN_DIMENSION = 20_000;
export const MAX_PIXEL_RATIO = 20;
export const MAX_FILL_SPEED_MS = 86_400_000;
export const MAX_CONTEXT_LENGTH = 2048;
export const MAX_LANGUAGE_LENGTH = 64;
export const MAX_TIMEZONE_LENGTH = 128;
export const MAX_PLATFORM_LENGTH = 64;
export const MAX_PLATFORM_VERSION_LENGTH = 64;
export const MAX_DEVICE_TYPE_LENGTH = 64;
export const MAX_CONNECTION_TYPE_LENGTH = 64;
export const MAX_UTM_VALUE_LENGTH = 256;
export const MAX_SESSION_ID_LENGTH = 128;
export const MAX_VISITOR_ID_LENGTH = 128;
export const MAX_NETWORK_LATENCY_MS = 120_000;
export const MAX_DEVICE_MEMORY_GB = 1024;
export const MAX_CPU_CORES = 256;
export const MAX_DOWNLINK_SPEED = 10_000;
export const MAX_GPU_NAME_LENGTH = 256;
export const MAX_PAGE_LOAD_TIME_MS = 600_000;
export const WINDOWS_11_PLATFORM_VERSION_MAJOR = 13;

export const screenSchema = z.object({
	width: z.number().int().min(0).max(MAX_SCREEN_DIMENSION),
	height: z.number().int().min(0).max(MAX_SCREEN_DIMENSION),
	viewportWidth: z.number().int().min(0).max(MAX_SCREEN_DIMENSION),
	viewportHeight: z.number().int().min(0).max(MAX_SCREEN_DIMENSION),
	pixelRatio: z.number().min(0).max(MAX_PIXEL_RATIO),
});

export const utmTagsSchema = z.object({
	source: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	medium: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	campaign: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	term: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	content: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
	id: z.string().trim().max(MAX_UTM_VALUE_LENGTH).optional(),
});

export const contactRequestSchema = contactSchema.extend({
	pageUrl: z.string().trim().pipe(z.url()).optional(),
	clientContext: z
		.object({
			referrer: z.string().trim().max(MAX_CONTEXT_LENGTH).optional(),
			language: z.string().trim().max(MAX_LANGUAGE_LENGTH).optional(),
			timezone: z.string().trim().max(MAX_TIMEZONE_LENGTH).optional(),
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
			downlinkSpeed: z.number().min(0).max(MAX_DOWNLINK_SPEED).optional(),
			deviceGpu: z.string().trim().max(MAX_GPU_NAME_LENGTH).optional(),
			colorScheme: z.enum(['light', 'dark']).optional(),
			touchSupport: z.boolean().optional(),
			pageLoadTime: z.number().int().min(0).max(MAX_PAGE_LOAD_TIME_MS).optional(),
		})
		.optional(),
});

export type ContactRequestPayload = z.output<typeof contactRequestSchema>;
export type ContactClientScreen = z.output<typeof screenSchema>;
export type ContactUtmTags = z.output<typeof utmTagsSchema>;
export type ContactClientContext = NonNullable<ContactRequestPayload['clientContext']>;
export type ContactRequestFieldErrors = Partial<Record<keyof ContactRequestPayload, string[]>>;
export type ContactTelegramMetadata = Parameters<typeof sendContactTelegramMessage>[1];
export type ContactTelegramPayload = Parameters<typeof sendContactTelegramMessage>[0];

export type ContactApiSuccess = {
	success: true;
};

export type ContactApiError = {
	success: false;
	error: string;
	issues?: ContactRequestFieldErrors;
};
