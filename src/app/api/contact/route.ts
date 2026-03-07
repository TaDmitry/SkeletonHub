import { NextResponse } from 'next/server';
import { z } from 'zod';

import { supabase } from '@/shared/lib/supabase/supabase';
import { sendContactTelegramMessage } from '@/shared/lib/telegram';

import { enrichContactMetadata } from './metadata';
import { parseBody, toContactTelegramPayload } from './resolvers';
import type { ContactApiError, ContactApiSuccess, ContactRequestFieldErrors } from './schema';
import { contactRequestSchema } from './schema';

export async function POST(request: Request) {
	const body = await parseBody(request);

	if (body === null) {
		console.error('[api/contact] Invalid JSON payload.');
		const response: ContactApiError = { success: false, error: 'Invalid JSON payload.' };

		return NextResponse.json(response, { status: 400 });
	}

	const parsedPayload = contactRequestSchema.safeParse(body);

	if (!parsedPayload.success) {
		const { fieldErrors } = z.flattenError(parsedPayload.error);
		const issues: ContactRequestFieldErrors = fieldErrors;
		console.warn('[api/contact] Validation failed.', issues);
		const response: ContactApiError = { success: false, error: 'Validation failed.', issues };

		return NextResponse.json(response, { status: 400 });
	}

	const contactData = toContactTelegramPayload(parsedPayload.data);
	const enrichedMetadata = await enrichContactMetadata(request, parsedPayload.data);
	const telegramResult = await sendContactTelegramMessage(contactData, enrichedMetadata);

	if (!telegramResult.success) {
		console.error('[api/contact] Unable to send message.', telegramResult.error);
		const response: ContactApiError = { success: false, error: 'Unable to send message.' };

		return NextResponse.json(response, { status: 500 });
	}

	//* Сохраняем в Supabase
	const { data: payload } = parsedPayload;
	const ctx = payload.clientContext;
	const { metrics } = payload;

	const { error: dbError } = await supabase.from('contact_submissions').insert({
		name: payload.name ?? null,
		email: payload.email,
		telegram: payload.telegram ?? null,
		message: payload.message,
		page_url: payload.pageUrl ?? null,

		referrer: ctx?.referrer ?? null,
		language: ctx?.language ?? null,
		timezone: ctx?.timezone ?? null,
		platform: ctx?.platform ?? null,
		platform_version: ctx?.platformVersion ?? null,
		device_type: ctx?.deviceType ?? null,
		connection_type: ctx?.connectionType ?? null,
		utm_tags: ctx?.utmTags ?? null,
		screen: ctx?.screen ?? null,

		fill_speed_ms: metrics?.fillSpeedMs ?? null,
		session_id: metrics?.sessionId ?? null,
		visitor_id: metrics?.visitorId ?? null,
		network_latency_ms: metrics?.networkLatencyMs ?? null,
		device_memory_gb: metrics?.deviceMemoryGb ?? null,
		cpu_cores: metrics?.cpuCores ?? null,
		downlink_speed: metrics?.downlinkSpeed ?? null,
		device_gpu: metrics?.deviceGpu ?? null,
		color_scheme: metrics?.colorScheme ?? null,
		touch_support: metrics?.touchSupport ?? null,
		page_load_time: metrics?.pageLoadTime ?? null,

		ip_address: enrichedMetadata?.geo?.ip ?? null,
		user_agent: enrichedMetadata?.device?.browser ?? null,
		country: enrichedMetadata?.geo?.country ?? null,
		city: enrichedMetadata?.geo?.timezone ?? null,
	});

	if (dbError) {
		//* Не фейлим запрос Telegram уже отправлен, просто логируем
		console.error('[api/contact] Failed to save to Supabase.', dbError);
	}

	const response: ContactApiSuccess = { success: true };

	return NextResponse.json(response, { status: 200 });
}
