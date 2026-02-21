import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyPassword, createSession, checkBruteForce, recordFailedLogin, clearLoginAttempts } from '$lib/server/auth';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	const ip = getClientAddress();
	if (!checkBruteForce(ip)) {
		return json({ error: 'Too many login attempts. Try again in 15 minutes.' }, { status: 429 });
	}

	const { email, password } = await request.json();
	if (!email || !password) return json({ error: 'Email and password required' }, { status: 400 });

	const [user] = await sql`
		SELECT u.id, u.email, u.name, u.password_hash, u.role, u.is_superuser, u.is_active, u.tenant_id
		FROM conduit_users u WHERE u.email = ${email}
	`;

	if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash))) {
		recordFailedLogin(ip);
		return json({ error: 'Invalid credentials' }, { status: 401 });
	}

	clearLoginAttempts(ip);
	const { sessionId, expiresAt } = await createSession(user.id, user.tenant_id, ip, request.headers.get('user-agent') || undefined);
	await sql`UPDATE conduit_users SET last_login_at = NOW() WHERE id = ${user.id}`;

	cookies.set('conduit_session', sessionId, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		expires: expiresAt
	});

	return json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, is_superuser: user.is_superuser } });
};
