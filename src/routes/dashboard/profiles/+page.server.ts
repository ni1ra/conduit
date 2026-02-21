import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	const search = url.searchParams.get('user_id') || '';

	const params = new URLSearchParams();
	if (search) params.set('user_id', search);

	try {
		const res = await fetch(`${url.origin}/api/v1/profiles?${params}`, {
			headers: {
				cookie: request.headers.get('cookie') || ''
			}
		});

		if (!res.ok) {
			return { profiles: [], search, error: `Failed [${res.status}]` };
		}

		const data = await res.json();
		return {
			profiles: data.profiles ?? data ?? [],
			search,
			error: null
		};
	} catch (err) {
		return { profiles: [], search, error: 'Failed to load profiles' };
	}
};
