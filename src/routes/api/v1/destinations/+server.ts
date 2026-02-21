import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession, auditLog } from '$lib/server/auth';
import sql from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const destinations = await sql`
		SELECT d.id, d.name, d.type, d.config, d.is_active, d.filter_events, d.created_at,
			COUNT(dl.id)::int AS delivery_count,
			COUNT(CASE WHEN dl.status = 'delivered' THEN 1 END)::int AS delivered_count,
			COUNT(CASE WHEN dl.status = 'failed' THEN 1 END)::int AS failed_count
		FROM conduit_destinations d
		LEFT JOIN conduit_deliveries dl ON dl.destination_id = d.id
		WHERE d.tenant_id = ${session.tenantId}
		GROUP BY d.id
		ORDER BY d.created_at DESC
	`;

	return json({ destinations });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { name, type, config, filter_events } = await request.json();
	if (!name || !type) return json({ error: 'Name and type required' }, { status: 400 });

	const [dest] = await sql`
		INSERT INTO conduit_destinations (tenant_id, name, type, config, filter_events)
		VALUES (${session.tenantId}, ${name}, ${type},
			${JSON.stringify(config || {})}::jsonb,
			${sql.array(filter_events || [])})
		RETURNING id, name, type, is_active, created_at
	`;

	await auditLog({ tenantId: session.tenantId, userId: session.userId, action: 'destination.create', targetType: 'destination', targetId: String(dest.id) });

	return json({ destination: dest });
};
