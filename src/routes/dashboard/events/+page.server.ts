import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	const type = url.searchParams.get('type') || '';
	const event_name = url.searchParams.get('event_name') || '';
	const user_id = url.searchParams.get('user_id') || '';

	const params = new URLSearchParams();
	if (type) params.set('type', type);
	if (event_name) params.set('event_name', event_name);
	if (user_id) params.set('user_id', user_id);

	try {
		const res = await fetch(`${url.origin}/api/v1/analytics/events?${params}`, {
			headers: {
				cookie: request.headers.get('cookie') || ''
			}
		});

		if (!res.ok) {
			return { events: [], filters: { type, event_name, user_id }, error: `Failed [${res.status}]` };
		}

		const data = await res.json();
		return {
			events: data.events ?? data ?? [],
			filters: { type, event_name, user_id },
			error: null
		};
	} catch (err) {
		return { events: [], filters: { type, event_name, user_id }, error: 'Failed to load events' };
	}
};
