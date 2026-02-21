import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/server/auth';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	let userId: string | null = null;
	try {
		const body = await request.json();
		userId = body.user_id || null;
	} catch { /* empty body = tenant summary */ }

	if (userId) {
		const events = await sql`
			SELECT id, type, event_name, properties, context, timestamp
			FROM conduit_events
			WHERE tenant_id = ${session.tenantId} AND user_id = ${userId}
			ORDER BY timestamp DESC LIMIT 10000
		`;
		const [profile] = await sql`
			SELECT user_id, traits, anonymous_ids, first_seen, last_seen, event_count
			FROM conduit_profiles
			WHERE tenant_id = ${session.tenantId} AND user_id = ${userId}
		`;
		return json({
			gdpr_export: {
				type: 'user_data_export', user_id: userId, tenant_id: session.tenantId,
				generated_at: new Date().toISOString(), profile: profile || null,
				event_count: events.length, events
			}
		});
	}

	const [stats] = await sql`
		SELECT COUNT(*)::int AS total_events, COUNT(DISTINCT user_id)::int AS unique_users,
			MIN(timestamp) AS earliest_event, MAX(timestamp) AS latest_event
		FROM conduit_events WHERE tenant_id = ${session.tenantId}
	`;
	const [profileStats] = await sql`
		SELECT COUNT(*)::int AS total_profiles FROM conduit_profiles WHERE tenant_id = ${session.tenantId}
	`;
	return json({
		gdpr_export: {
			type: 'tenant_data_summary', tenant_id: session.tenantId,
			generated_at: new Date().toISOString(), total_events: stats.total_events,
			unique_users: stats.unique_users, total_profiles: profileStats.total_profiles,
			date_range: { from: stats.earliest_event, to: stats.latest_event }
		}
	});
};

export const GET: RequestHandler = async ({ cookies, url }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const userId = url.searchParams.get('user_id');

	if (userId) {
		const events = await sql`
			SELECT id, type, event_name, properties, context, timestamp
			FROM conduit_events
			WHERE tenant_id = ${session.tenantId} AND user_id = ${userId}
			ORDER BY timestamp DESC LIMIT 10000
		`;

		const [profile] = await sql`
			SELECT user_id, traits, anonymous_ids, first_seen, last_seen, event_count
			FROM conduit_profiles
			WHERE tenant_id = ${session.tenantId} AND user_id = ${userId}
		`;

		return json({
			gdpr_export: {
				type: 'user_data_export',
				user_id: userId,
				tenant_id: session.tenantId,
				generated_at: new Date().toISOString(),
				profile: profile || null,
				event_count: events.length,
				events
			}
		});
	}

	const [stats] = await sql`
		SELECT COUNT(*)::int AS total_events,
			COUNT(DISTINCT user_id)::int AS unique_users,
			MIN(timestamp) AS earliest_event,
			MAX(timestamp) AS latest_event
		FROM conduit_events WHERE tenant_id = ${session.tenantId}
	`;

	const [profileStats] = await sql`
		SELECT COUNT(*)::int AS total_profiles FROM conduit_profiles WHERE tenant_id = ${session.tenantId}
	`;

	return json({
		gdpr_export: {
			type: 'tenant_data_summary',
			tenant_id: session.tenantId,
			generated_at: new Date().toISOString(),
			total_events: stats.total_events,
			unique_users: stats.unique_users,
			total_profiles: profileStats.total_profiles,
			date_range: { from: stats.earliest_event, to: stats.latest_event }
		}
	});
};
