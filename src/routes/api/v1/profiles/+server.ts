import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/server/auth';
import sql from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const search = url.searchParams.get('search');
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

	let profiles;
	if (search) {
		profiles = await sql`
			SELECT id, user_id, anonymous_ids, traits, first_seen, last_seen, event_count
			FROM conduit_profiles
			WHERE tenant_id = ${session.tenantId} AND user_id ILIKE ${'%' + search + '%'}
			ORDER BY last_seen DESC LIMIT ${limit}
		`;
	} else {
		profiles = await sql`
			SELECT id, user_id, anonymous_ids, traits, first_seen, last_seen, event_count
			FROM conduit_profiles
			WHERE tenant_id = ${session.tenantId}
			ORDER BY last_seen DESC LIMIT ${limit}
		`;
	}

	return json({ profiles });
};
