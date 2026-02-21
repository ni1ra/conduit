import { validateSession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const session = await validateSession(cookies);
	if (!session) throw redirect(302, '/auth/login');
	return { session };
};
