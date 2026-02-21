import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/server/auth';
import sql from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies, params }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const [profile] = await sql`
		SELECT id, user_id, anonymous_ids, traits, first_seen, last_seen, event_count
		FROM conduit_profiles
		WHERE tenant_id = ${session.tenantId} AND user_id = ${params.userId}
	`;

	if (!profile) return json({ error: 'Profile not found' }, { status: 404 });

	const events = await sql`
		SELECT id, type, event_name, properties, context, timestamp
		FROM conduit_events
		WHERE tenant_id = ${session.tenantId} AND user_id = ${params.userId}
		ORDER BY timestamp DESC LIMIT 100
	`;

	return json({ profile, events });
};
