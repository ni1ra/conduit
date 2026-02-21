import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/server/auth';
import sql from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const type = url.searchParams.get('type');
	const eventName = url.searchParams.get('event_name');
	const userId = url.searchParams.get('user_id');
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);

	const conditions = [sql`e.tenant_id = ${session.tenantId}`];
	if (type) conditions.push(sql`e.type = ${type}`);
	if (eventName) conditions.push(sql`e.event_name = ${eventName}`);
	if (userId) conditions.push(sql`(e.user_id = ${userId} OR e.anonymous_id = ${userId})`);

	const where = conditions.reduce((a, b) => sql`${a} AND ${b}`);

	const events = await sql`
		SELECT e.id, e.type, e.event_name, e.anonymous_id, e.user_id, e.properties, e.context, e.timestamp,
			s.name AS source_name
		FROM conduit_events e
		LEFT JOIN conduit_sources s ON s.id = e.source_id
		WHERE ${where}
		ORDER BY e.timestamp DESC LIMIT ${limit}
	`;

	return json({ events });
};
