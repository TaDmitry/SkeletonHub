import type { ContactSchemaValues } from '@/shared/lib/validation';

export type TelegramResponse = {
	ok: boolean;
	description?: string;
};

export type SendContactGeoMetadata = {
	ip?: string;
	asn?: string;
	asName?: string;
	asDomain?: string;
	countryCode?: string;
	country?: string;
	continentCode?: string;
	continent?: string;
	timezone?: string;
};

export type SendContactDeviceMetadata = {
	browser?: string;
	os?: string;
	deviceType?: string;
	connectionType?: string;
	language?: string;
	screen?: string;
};

export type SendContactUtmTagsMetadata = {
	source?: string;
	medium?: string;
	campaign?: string;
	term?: string;
	content?: string;
	id?: string;
};

export type SendContactContextMetadata = {
	pageUrl?: string;
	referrer?: string;
	utmTags?: SendContactUtmTagsMetadata;
};

export type SendContactBusinessMetadata = {
	submittedAt?: Date;
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

export type SendContactMetadata = {
	pageUrl?: string;
	submittedAt?: Date;
	geo?: SendContactGeoMetadata;
	device?: SendContactDeviceMetadata;
	context?: SendContactContextMetadata;
	business?: SendContactBusinessMetadata;
};

export type ResolvedSendContactMetadata = {
	geo: Required<SendContactGeoMetadata>;
	device: Required<SendContactDeviceMetadata>;
	context: {
		pageUrl: string;
		referrer: string;
		utmTags: Required<SendContactUtmTagsMetadata>;
	};
	business: {
		submittedAt: Date;
		fillSpeedMs?: number;
		sessionId: string;
		visitorId: string;
		networkLatencyMs?: number;
		deviceMemoryGb?: number;
		cpuCores?: number;
		downlinkSpeed?: number;
		deviceGpu: string;
		colorScheme?: 'light' | 'dark';
		touchSupport?: boolean;
		pageLoadTime?: number;
	};
};

export type SendContactResult = { success: true } | { success: false; error: string };

export type ContactSchemaValuesPayload = ContactSchemaValues;
