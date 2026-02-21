import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateWriteKey } from '$lib/server/auth';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	const writeKey = request.headers.get('x-conduit-key') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
	const source = await authenticateWriteKey(writeKey || null);
	if (!source) return json({ error: 'Invalid write key' }, { status: 401 });

	try {
		const body = await request.json();
		const events = Array.isArray(body) ? body : (Array.isArray(body.events) ? body.events : [body]);
		if (events.length > 100) return json({ error: 'Batch limit is 100 events' }, { status: 400 });

		const ids: string[] = [];

		for (const e of events) {
			const type = e.type || 'track';
			const eventName = e.event || e.event_name || null;
			const userId = e.userId || e.user_id || null;
			const anonymousId = e.anonymousId || e.anonymous_id || null;
			const properties = e.properties || e.traits || {};
			const context = e.context || {};
			const timestamp = e.timestamp ? new Date(e.timestamp) : new Date();

			const [row] = await sql`
				INSERT INTO conduit_events (tenant_id, source_id, type, event_name, anonymous_id, user_id, properties, context, timestamp)
				VALUES (${source.tenantId}, ${source.sourceId}, ${type}, ${eventName}, ${anonymousId}, ${userId},
					${JSON.stringify(properties)}::jsonb, ${JSON.stringify(context)}::jsonb, ${timestamp})
				RETURNING id
			`;
			ids.push(row.id);

			// Upsert profile
			if (userId) {
				if (anonymousId) {
					await sql`
						INSERT INTO conduit_profiles (tenant_id, user_id, anonymous_ids, traits, event_count, last_seen)
						VALUES (${source.tenantId}, ${userId}, ${sql.array([anonymousId])}, ${type === 'identify' ? JSON.stringify(properties) : '{}'}::jsonb, 1, NOW())
						ON CONFLICT (tenant_id, user_id) DO UPDATE SET
							anonymous_ids = CASE
								WHEN NOT (conduit_profiles.anonymous_ids @> ARRAY[${anonymousId}]::text[])
								THEN array_append(conduit_profiles.anonymous_ids, ${anonymousId})
								ELSE conduit_profiles.anonymous_ids
							END,
							traits = CASE WHEN ${type} = 'identify' THEN conduit_profiles.traits || ${JSON.stringify(properties)}::jsonb ELSE conduit_profiles.traits END,
							event_count = conduit_profiles.event_count + 1,
							last_seen = NOW()
					`;
				} else {
					await sql`
						INSERT INTO conduit_profiles (tenant_id, user_id, anonymous_ids, traits, event_count, last_seen)
						VALUES (${source.tenantId}, ${userId}, ARRAY[]::text[], ${type === 'identify' ? JSON.stringify(properties) : '{}'}::jsonb, 1, NOW())
						ON CONFLICT (tenant_id, user_id) DO UPDATE SET
							traits = CASE WHEN ${type} = 'identify' THEN conduit_profiles.traits || ${JSON.stringify(properties)}::jsonb ELSE conduit_profiles.traits END,
							event_count = conduit_profiles.event_count + 1,
							last_seen = NOW()
					`;
				}
			}
		}

		return json({ accepted: true, event_ids: ids, count: ids.length }, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, X-Conduit-Key, Authorization'
			}
		});
	} catch (err) {
		console.error('[CONDUIT] Track error:', err);
		return json({ error: 'Failed to process events', detail: String(err) }, { status: 500 });
	}
};

export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, X-Conduit-Key, Authorization'
		}
	});
};
