import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/server/auth';
import sql from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const [tenant] = await sql`
		SELECT id, name AS tenant_name, slug, plan, created_at
		FROM conduit_tenants WHERE id = ${session.tenantId}
	`;

	if (!tenant) return json({ error: 'Tenant not found' }, { status: 404 });

	return json(tenant);
};
