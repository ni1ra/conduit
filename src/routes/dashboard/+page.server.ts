import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	try {
		const res = await fetch(`${url.origin}/api/v1/analytics/overview`, {
			headers: {
				cookie: request.headers.get('cookie') || ''
			}
		});

		if (!res.ok) {
			return {
				stats: null,
				error: `Failed to load overview [${res.status}]`
			};
		}

		const stats = await res.json();
		return { stats, error: null };
	} catch (err) {
		return {
			stats: null,
			error: 'Failed to connect to analytics service'
		};
	}
};
