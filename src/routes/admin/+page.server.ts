import { validateSession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url, request }) => {
	const session = await validateSession(cookies);
	if (!session) throw redirect(302, '/auth/login');
	if (session.role !== 'superuser' && session.role !== 'superadmin') {
		throw redirect(302, '/dashboard');
	}

	try {
		const res = await fetch(`${url.origin}/api/v1/admin/overview`, {
			headers: {
				cookie: request.headers.get('cookie') || ''
			}
		});

		if (!res.ok) {
			return { session, admin: null, error: `Failed [${res.status}]` };
		}

		const admin = await res.json();
		return { session, admin, error: null };
	} catch (err) {
		return { session, admin: null, error: 'Failed to load admin data' };
	}
};
