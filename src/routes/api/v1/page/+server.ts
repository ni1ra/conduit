import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateWriteKey } from '$lib/server/auth';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	const writeKey = request.headers.get('x-conduit-key') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
	const source = await authenticateWriteKey(writeKey || null);
	if (!source) return json({ error: 'Invalid write key' }, { status: 401 });

	const body = await request.json();
	const properties = { ...body.properties, name: body.name, url: body.url, path: body.path, title: body.title };

	const [event] = await sql`
		INSERT INTO conduit_events (tenant_id, source_id, type, event_name, anonymous_id, user_id, properties, context)
		VALUES (${source.tenantId}, ${source.sourceId}, 'page', ${body.name || null},
			${body.anonymousId || body.anonymous_id || null}, ${body.userId || body.user_id || null},
			${JSON.stringify(properties)}::jsonb, ${JSON.stringify(body.context || {})}::jsonb)
		RETURNING id
	`;

	return json({ accepted: true, event_id: event.id }, {
		headers: { 'Access-Control-Allow-Origin': '*' }
	});
};
