import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateWriteKey } from '$lib/server/auth';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	const writeKey = request.headers.get('x-conduit-key') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
	const source = await authenticateWriteKey(writeKey || null);
	if (!source) return json({ error: 'Invalid write key' }, { status: 401 });

	const body = await request.json();
	const userId = body.userId || body.user_id;
	if (!userId) return json({ error: 'userId required' }, { status: 400 });

	const traits = body.traits || {};
	const anonymousId = body.anonymousId || body.anonymous_id || null;
	const context = body.context || {};

	const [event] = await sql`
		INSERT INTO conduit_events (tenant_id, source_id, type, event_name, anonymous_id, user_id, properties, context)
		VALUES (${source.tenantId}, ${source.sourceId}, 'identify', NULL, ${anonymousId}, ${userId},
			${JSON.stringify(traits)}::jsonb, ${JSON.stringify(context)}::jsonb)
		RETURNING id
	`;

	await sql`
		INSERT INTO conduit_profiles (tenant_id, user_id, anonymous_ids, traits, event_count, last_seen)
		VALUES (${source.tenantId}, ${userId},
			${anonymousId ? sql.array([anonymousId]) : sql.array([], 'text')},
			${JSON.stringify(traits)}::jsonb, 1, NOW())
		ON CONFLICT (tenant_id, user_id) DO UPDATE SET
			anonymous_ids = CASE
				WHEN ${anonymousId}::text IS NOT NULL AND NOT (conduit_profiles.anonymous_ids @> ARRAY[${anonymousId || ''}]::text[])
				THEN array_append(conduit_profiles.anonymous_ids, ${anonymousId || ''})
				ELSE conduit_profiles.anonymous_ids
			END,
			traits = conduit_profiles.traits || ${JSON.stringify(traits)}::jsonb,
			event_count = conduit_profiles.event_count + 1,
			last_seen = NOW()
	`;

	return json({ accepted: true, event_id: event.id }, {
		headers: { 'Access-Control-Allow-Origin': '*' }
	});
};
