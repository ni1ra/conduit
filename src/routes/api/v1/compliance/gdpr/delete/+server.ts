import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession, auditLog } from '$lib/server/auth';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { user_id } = await request.json();
	if (!user_id) return json({ error: 'user_id required' }, { status: 400 });

	const eventResult = await sql`
		DELETE FROM conduit_events
		WHERE tenant_id = ${session.tenantId} AND user_id = ${user_id}
	`;

	await sql`
		DELETE FROM conduit_profiles
		WHERE tenant_id = ${session.tenantId} AND user_id = ${user_id}
	`;

	await auditLog({
		tenantId: session.tenantId,
		userId: session.userId,
		action: 'gdpr.delete',
		targetType: 'tracked_user',
		targetId: user_id,
		metadata: { deleted_events: eventResult.count }
	});

	return json({ deleted: true, user_id, events_deleted: eventResult.count, timestamp: new Date().toISOString() });
};
