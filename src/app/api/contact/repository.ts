import { supabaseServer } from '@/shared/lib/supabase/server';

import type { ContactRequestPayload, ContactTelegramMetadata } from './schema';

export type SaveContactSubmissionResult = { success: true } | { success: false };

function buildContactSubmissionRecord(
	payload: ContactRequestPayload,
	enrichedMetadata: ContactTelegramMetadata
) {
	const { business, device, geo } = enrichedMetadata ?? {};

	return {
		name: payload.name ?? null,
		email: payload.email,
		telegram: payload.telegram ?? null,
		message: payload.message,
		page_url: payload.pageUrl ?? null,

		ip_address: geo?.ip ?? null,
		asn: geo?.asn ?? null,
		as_name: geo?.asName ?? null,
		as_domain: geo?.asDomain ?? null,
		country_code: geo?.countryCode ?? null,
		country: geo?.country ?? null,
		continent_code: geo?.continentCode ?? null,
		continent: geo?.continent ?? null,
		timezone: geo?.timezone ?? null,

		browser: device?.browser ?? null,
		os: device?.os ?? null,
		device_type: device?.deviceType ?? null,
		connection_type: device?.connectionType ?? null,
		language: device?.language ?? null,
		screen: device?.screen ?? null,
		gpu: business?.deviceGpu ?? null,
		color_scheme: business?.colorScheme ?? null,
		touch_support: business?.touchSupport ?? null,

		submitted_at: business?.submittedAt ?? null,
		fill_speed_ms: business?.fillSpeedMs ?? null,
		session_id: business?.sessionId ?? null,
		visitor_id: business?.visitorId ?? null,
		network_latency_ms: business?.networkLatencyMs ?? null,
		device_memory_gb: business?.deviceMemoryGb ?? null,
		cpu_cores: business?.cpuCores ?? null,
		downlink_speed: business?.downlinkSpeed ?? null,
		page_load_time: business?.pageLoadTime ?? null,
	};
}

export async function saveContactSubmission(
	payload: ContactRequestPayload,
	enrichedMetadata: ContactTelegramMetadata
): Promise<SaveContactSubmissionResult> {
	const { error } = await supabaseServer
		.from('contact_submissions')
		.insert(buildContactSubmissionRecord(payload, enrichedMetadata));

	if (error) {
		console.error('[api/contact] Failed to save to Supabase.', error);

		return { success: false };
	}

	return { success: true };
}
