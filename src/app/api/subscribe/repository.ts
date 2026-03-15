import { supabaseServer } from '@/shared/lib/supabase/server';

const DUPLICATE_ENTRY_ERROR_CODE = '23505';

export type SaveSubscriberResult =
	| { success: true }
	| { success: false; reason: 'already-subscribed' | 'unexpected' };

export async function saveSubscriberEmail(email: string): Promise<SaveSubscriberResult> {
	const { error } = await supabaseServer.from('subscribers').insert({ email });

	if (!error) {
		return { success: true };
	}

	if (error.code === DUPLICATE_ENTRY_ERROR_CODE) {
		return {
			success: false,
			reason: 'already-subscribed',
		};
	}

	console.error('[api/subscribe] Failed to save subscriber.', error);

	return {
		success: false,
		reason: 'unexpected',
	};
}
