import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	return json({
		user: {
			id: session.userId,
			email: session.email,
			name: session.name,
			role: session.role,
			is_superuser: session.isSuperuser,
			tenant: { id: session.tenantId, slug: session.tenantSlug, name: session.tenantName }
		}
	});
};
