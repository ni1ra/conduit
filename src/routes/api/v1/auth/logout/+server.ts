import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession, revokeSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies);
	if (session) await revokeSession(session.sessionId);
	cookies.delete('conduit_session', { path: '/' });
	return json({ success: true });
};
