import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession, generateWriteKey, hashToken, auditLog } from '$lib/server/auth';
import sql from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const sources = await sql`
		SELECT s.id, s.name, s.slug, s.type, s.is_active, s.created_at,
			COUNT(e.id)::int AS event_count
		FROM conduit_sources s
		LEFT JOIN conduit_events e ON e.source_id = s.id AND e.timestamp > NOW() - INTERVAL '30 days'
		WHERE s.tenant_id = ${session.tenantId}
		GROUP BY s.id
		ORDER BY s.created_at DESC
	`;

	return json({ sources });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { name, type } = await request.json();
	if (!name) return json({ error: 'Source name required' }, { status: 400 });

	const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	const writeKey = generateWriteKey();

	const [source] = await sql`
		INSERT INTO conduit_sources (tenant_id, name, slug, write_key_hash, type)
		VALUES (${session.tenantId}, ${name}, ${slug}, ${hashToken(writeKey)}, ${type || 'javascript'})
		RETURNING id, name, slug, type, created_at
	`;

	await auditLog({ tenantId: session.tenantId, userId: session.userId, action: 'source.create', targetType: 'source', targetId: String(source.id) });

	return json({ source, write_key: writeKey, warning: 'Store this write key securely. It will not be shown again.' });
};
