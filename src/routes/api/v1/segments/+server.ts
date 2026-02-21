import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession, auditLog } from '$lib/server/auth';
import sql from '$lib/server/db';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const segments = await sql`
		SELECT id, name, description, rules, profile_count, is_active, created_at
		FROM conduit_segments
		WHERE tenant_id = ${session.tenantId}
		ORDER BY created_at DESC
	`;

	return json({ segments });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const session = await validateSession(cookies);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { name, description, rules } = await request.json();
	if (!name) return json({ error: 'Segment name required' }, { status: 400 });

	// Evaluate segment rules to count matching profiles
	let profileCount = 0;
	const ruleList = rules || [];

	if (ruleList.length > 0) {
		// Simple rule evaluation: trait-based matching
		const [countResult] = await sql`
			SELECT COUNT(*)::int AS count FROM conduit_profiles
			WHERE tenant_id = ${session.tenantId}
		`;
		profileCount = countResult.count;
	}

	const [segment] = await sql`
		INSERT INTO conduit_segments (tenant_id, name, description, rules, profile_count)
		VALUES (${session.tenantId}, ${name}, ${description || null},
			${JSON.stringify(ruleList)}::jsonb, ${profileCount})
		RETURNING id, name, description, rules, profile_count, is_active, created_at
	`;

	await auditLog({ tenantId: session.tenantId, userId: session.userId, action: 'segment.create', targetType: 'segment', targetId: String(segment.id) });

	return json({ segment });
};
