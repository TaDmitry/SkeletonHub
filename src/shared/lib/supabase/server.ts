import 'server-only';

import { createClient } from '@supabase/supabase-js';

let hasLoggedMissingServiceRoleKey = false;

function resolveSupabaseServerKey() {
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (serviceRoleKey) {
		return serviceRoleKey;
	}

	if (!hasLoggedMissingServiceRoleKey) {
		console.warn(
			'[supabase/server] SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to the public key, so server-side inserts may fail because of RLS.'
		);
		hasLoggedMissingServiceRoleKey = true;
	}

	return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
}

export const supabaseServer = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	resolveSupabaseServerKey(),
	{
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	}
);
