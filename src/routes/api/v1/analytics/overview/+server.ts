import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/server/auth';
import sql from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const [stats24h] = await sql`
		SELECT COUNT(*)::int AS events
		FROM conduit_events WHERE tenant_id = ${session.tenantId} AND timestamp > NOW() - INTERVAL '24 hours'
	`;

	const [profileCount] = await sql`
		SELECT COUNT(*)::int AS count FROM conduit_profiles WHERE tenant_id = ${session.tenantId}
	`;

	const [sourceCount] = await sql`
		SELECT COUNT(*)::int AS count FROM conduit_sources WHERE tenant_id = ${session.tenantId} AND is_active = TRUE
	`;

	const [destCount] = await sql`
		SELECT COUNT(*)::int AS count FROM conduit_destinations WHERE tenant_id = ${session.tenantId} AND is_active = TRUE
	`;

	const [segmentCount] = await sql`
		SELECT COUNT(*)::int AS count FROM conduit_segments WHERE tenant_id = ${session.tenantId} AND is_active = TRUE
	`;

	const topEvents = await sql`
		SELECT event_name, type, COUNT(*)::int AS count
		FROM conduit_events
		WHERE tenant_id = ${session.tenantId} AND timestamp > NOW() - INTERVAL '24 hours'
		GROUP BY event_name, type ORDER BY count DESC LIMIT 10
	`;

	const dailyTrend = await sql`
		SELECT DATE_TRUNC('day', timestamp)::date AS day, COUNT(*)::int AS events
		FROM conduit_events
		WHERE tenant_id = ${session.tenantId} AND timestamp > NOW() - INTERVAL '7 days'
		GROUP BY day ORDER BY day
	`;

	return json({
		stats_24h: { events: stats24h.events },
		active_profiles: profileCount.count,
		sources: sourceCount.count,
		destinations: destCount.count,
		segments: segmentCount.count,
		top_events: topEvents,
		daily_trend: dailyTrend
	});
};
