import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		sovereignty: {
			jurisdiction: 'EU',
			data_residency: 'eu-west-1',
			infrastructure: {
				compute: 'Vercel EU (Frankfurt/Amsterdam)',
				database: 'Supabase PostgreSQL (eu-west-1, Frankfurt)',
				dns: 'Vercel Edge Network'
			},
			compliance: {
				gdpr: true,
				ai_act: true,
				dora_ready: true,
				nis2_ready: true,
				schrems_ii: 'No US data transfers for customer data. All CDP storage EU-only.',
				eprivacy: 'No tracking cookies. Server-side event collection only.'
			},
			data_collection: {
				cookies: 'Session cookie only (conduit_session). No tracking cookies.',
				pii: 'Customer traits stored per customer configuration. PII scrubbing available.',
				ip_addresses: 'Not stored in events.',
				fingerprinting: 'None. Server-side data collection via write keys.'
			},
			segment_note: 'Segment was acquired by Twilio ($3.2B). Both US-incorporated with CLOUD Act exposure. CONDUIT provides EU-sovereign alternative.',
			us_service_dependencies: [],
			third_party_analytics: false,
			attestation: {
				generated_at: new Date().toISOString(),
				version: '1.0.0',
				product: 'CONDUIT EU Customer Data Platform',
				operator: 'EUROSTACK'
			}
		}
	}, {
		headers: {
			'Cache-Control': 'public, max-age=3600',
			'X-Sovereignty-Jurisdiction': 'EU'
		}
	});
};
