import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	try {
		const res = await fetch(`${url.origin}/api/v1/segments`, {
			headers: {
				cookie: request.headers.get('cookie') || ''
			}
		});

		if (!res.ok) {
			return { segments: [], error: `Failed [${res.status}]` };
		}

		const data = await res.json();
		return {
			segments: data.segments ?? data ?? [],
			error: null
		};
	} catch (err) {
		return { segments: [], error: 'Failed to load segments' };
	}
};
