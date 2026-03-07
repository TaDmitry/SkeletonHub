import type { ContactSchemaValues } from '@/shared/lib/validation';

export type ContactApiResponse = {
	success: boolean;
	error?: string;
};

export type ContactApiPayload = ContactSchemaValues & {
	pageUrl?: string;
	clientContext?: {
		referrer?: string;
		language?: string;
		timezone?: string;
		platform?: string;
		platformVersion?: string;
		deviceType?: string;
		connectionType?: string;
		utmTags?: {
			source?: string;
			medium?: string;
			campaign?: string;
			term?: string;
			content?: string;
			id?: string;
		};
		screen?: {
			width: number;
			height: number;
			viewportWidth: number;
			viewportHeight: number;
			pixelRatio: number;
		};
	};
	metrics?: {
		fillSpeedMs?: number;
		sessionId?: string;
		visitorId?: string;
		networkLatencyMs?: number;
		deviceMemoryGb?: number;
		cpuCores?: number;
		downlinkSpeed?: number;
		deviceGpu?: string;
		colorScheme?: 'light' | 'dark';
		touchSupport?: boolean;
		pageLoadTime?: number;
	};
};

export type ContactFormProps = {
	className?: string;
};
