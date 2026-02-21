import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	try {
		const res = await fetch(`${url.origin}/api/v1/sources`, {
			headers: {
				cookie: request.headers.get('cookie') || ''
			}
		});

		if (!res.ok) {
			return { sources: [], error: `Failed [${res.status}]` };
		}

		const data = await res.json();
		return {
			sources: data.sources ?? data ?? [],
			error: null
		};
	} catch (err) {
		return { sources: [], error: 'Failed to load sources' };
	}
};
