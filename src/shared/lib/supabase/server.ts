import 'server-only';

import { createClient } from '@supabase/supabase-js';

function resolveSupabaseServerKey() {
	return (
		process.env.SUPABASE_SERVICE_ROLE_KEY ??
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
	);
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
