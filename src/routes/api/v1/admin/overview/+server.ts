import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/server/auth';
import sql from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });
	if (session.role !== 'superuser' && session.role !== 'superadmin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const [tenantCount] = await sql`SELECT count(*)::int AS c FROM conduit_tenants`;
	const [userCount] = await sql`SELECT count(*)::int AS c FROM conduit_users`;
	const [eventCount] = await sql`SELECT count(*)::int AS c FROM conduit_events`;
	const [sourceCount] = await sql`SELECT count(*)::int AS c FROM conduit_sources`;
	const [destCount] = await sql`SELECT count(*)::int AS c FROM conduit_destinations`;

	const tenants = await sql`
		SELECT t.id, t.name, t.slug, t.plan, t.created_at,
			(SELECT count(*)::int FROM conduit_users u WHERE u.tenant_id = t.id) AS user_count,
			(SELECT count(*)::int FROM conduit_events e WHERE e.tenant_id = t.id) AS event_count
		FROM conduit_tenants t ORDER BY t.created_at DESC
	`;

	const users = await sql`
		SELECT u.id, u.email, u.name, u.role, u.last_login_at AS last_login,
			t.name AS tenant_name
		FROM conduit_users u
		JOIN conduit_tenants t ON t.id = u.tenant_id
		ORDER BY u.created_at DESC
	`;

	return json({
		stats: {
			total_tenants: tenantCount.c,
			total_users: userCount.c,
			total_events: eventCount.c,
			total_sources: sourceCount.c,
			total_destinations: destCount.c
		},
		tenants,
		users
	});
};
