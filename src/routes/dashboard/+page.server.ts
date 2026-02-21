import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, request }) => {
	try {
		const res = await fetch(`${url.origin}/api/v1/analytics/overview`, {
			headers: {
				cookie: request.headers.get('cookie') || ''
			}
		});

		if (!res.ok) {
			return { stats: null, error: `Failed to load overview [${res.status}]` };
		}

		const d = await res.json();
		return {
			stats: {
				events_24h: d.stats_24h?.events ?? 0,
				active_profiles: d.active_profiles ?? 0,
				source_count: d.sources ?? 0,
				destination_count: d.destinations ?? 0,
				segment_count: d.segments ?? 0,
				events_trend: null,
				top_events: (d.top_events || []).map((e: Record<string, unknown>) => ({
					event_name: e.event_name || e.type || 'unknown',
					count: e.count ?? 0
				})),
				daily_trend: (d.daily_trend || []).map((e: Record<string, unknown>) => ({
					date: String(e.day || ''),
					count: e.events ?? 0
				}))
			},
			error: null
		};
	} catch (err) {
		return { stats: null, error: 'Failed to connect to analytics service' };
	}
};
