import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hashPassword, generateWriteKey, hashToken, createSession } from '$lib/server/auth';
import sql from '$lib/server/db';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	const { email, password, name, org_name } = await request.json();
	if (!email || !password || !org_name) return json({ error: 'Email, password, and org_name required' }, { status: 400 });
	if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, { status: 400 });

	const [existing] = await sql`SELECT id FROM conduit_users WHERE email = ${email}`;
	if (existing) return json({ error: 'Email already registered' }, { status: 409 });

	const slug = org_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	const passwordHash = await hashPassword(password);
	const writeKey = generateWriteKey();

	const [tenant] = await sql`
		INSERT INTO conduit_tenants (name, slug) VALUES (${org_name}, ${slug})
		RETURNING id, slug, name
	`;

	const [user] = await sql`
		INSERT INTO conduit_users (tenant_id, email, password_hash, name, role, is_superuser)
		VALUES (${tenant.id}, ${email}, ${passwordHash}, ${name || email.split('@')[0]}, 'owner',
			${email === process.env.ADMIN_EMAIL})
		RETURNING id, email, name
	`;

	const sourceSlug = slug + '-web';
	const [source] = await sql`
		INSERT INTO conduit_sources (tenant_id, name, slug, write_key_hash, type)
		VALUES (${tenant.id}, ${org_name + ' Web'}, ${sourceSlug}, ${hashToken(writeKey)}, 'javascript')
		RETURNING id, name
	`;

	const { sessionId, expiresAt } = await createSession(user.id, tenant.id, getClientAddress());

	cookies.set('conduit_session', sessionId, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		expires: expiresAt
	});

	return json({
		user: { id: user.id, email: user.email, name: user.name },
		tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
		source: { id: source.id, name: source.name },
		write_key: writeKey,
		warning: 'Store this write key securely. It will not be shown again.'
	});
};
