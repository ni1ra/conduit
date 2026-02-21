import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	try {
		const res = await fetch(`${url.origin}/api/v1/settings`, {
			headers: {
				cookie: request.headers.get('cookie') || ''
			}
		});

		if (!res.ok) {
			return { settings: null, error: `Failed [${res.status}]` };
		}

		const settings = await res.json();
		return { settings, error: null };
	} catch (err) {
		return { settings: null, error: 'Failed to load settings' };
	}
};
