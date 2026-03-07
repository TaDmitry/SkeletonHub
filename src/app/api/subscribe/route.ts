import { supabase } from '@/shared/lib/supabase/supabase';

export async function POST(req: Request) {
	const { email } = await req.json();

	const { error } = await supabase.from('subscribers').insert({ email });

	if (error) {
		if (error.code === '23505') {
			return Response.json({ error: 'Email already subscribed' }, { status: 409 });
		}

		return Response.json({ error: error.message }, { status: 400 });
	}

	return Response.json({ success: true });
}
