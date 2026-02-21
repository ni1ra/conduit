# CONDUIT — EU-Sovereign Customer Data Platform

## Mission
Replace Segment/Twilio for EU companies. Route customer events from any source to any destination with identity resolution, audience segmentation, and full GDPR compliance. All data stays in EU.

## Why Now
Segment was acquired by Twilio ($3.2B) — a US company subject to CLOUD Act. CDPs route ALL customer PII (behavioral data, purchase history, identity). Zero EU-headquartered CDP exists. EXTREME regulatory pressure under GDPR + NIS2.

## Architecture

### Stack
- **Framework**: SvelteKit 5 (Vercel adapter, nodejs22.x, fra1)
- **Database**: Supabase PostgreSQL eu-west-1 (shared, conduit_ prefix)
- **Auth**: bcrypt passwords, SHA-256 source keys, httpOnly session cookies
- **Aesthetic**: The Wired (amber/orange primary #ff8c00, CRT scanlines)

### Core Concepts
1. **Sources** — Where events come from (JS SDK, REST API, server-side SDKs)
2. **Events** — Track, Identify, Page, Group, Alias calls
3. **Users** — Unified profiles with identity resolution (merge anonymous → known)
4. **Segments** — Audience rules (event-based, property-based, behavioral)
5. **Destinations** — Where events go (webhooks, databases, analytics tools)
6. **Consent** — Per-user consent tracking for GDPR categories

### Database Schema (conduit_ prefix)

```sql
-- Core
conduit_tenants (id, name, slug, plan, created_at)
conduit_users (id, tenant_id, email, password_hash, name, role, is_superuser, is_active, created_at)
conduit_sessions (id UUID, user_id, tenant_id, expires_at, ip_address, revoked_at, created_at)

-- Sources & Destinations
conduit_sources (id, tenant_id, name, slug, write_key_hash, type, is_active, settings JSONB, created_at)
conduit_destinations (id, tenant_id, name, type, config JSONB, is_active, filter_events TEXT[], created_at)

-- Events & Profiles
conduit_events (id UUID, tenant_id, source_id, type, event_name, anonymous_id, user_id, properties JSONB, context JSONB, timestamp, received_at)
conduit_profiles (id, tenant_id, user_id VARCHAR UNIQUE per tenant, anonymous_ids TEXT[], traits JSONB, first_seen, last_seen, event_count INT, created_at)
conduit_consent (id, tenant_id, profile_id, category, status, updated_at)

-- Segments & Delivery
conduit_segments (id, tenant_id, name, description, rules JSONB, profile_count INT, is_active, created_at)
conduit_deliveries (id, tenant_id, destination_id, event_id, status, response_code, error, delivered_at)

-- Audit
conduit_audit_log (id BIGSERIAL, tenant_id, user_id, action, target_type, target_id, metadata JSONB, created_at)
```

### API Endpoints

**Auth**
- POST /api/v1/auth/register — Create account + org + source
- POST /api/v1/auth/login — Login (brute-force protected)
- GET /api/v1/auth/me — Current user
- POST /api/v1/auth/logout — Revoke session

**Event Ingestion** (Source key auth)
- POST /api/v1/track — Track events (batch supported)
- POST /api/v1/identify — Identify user (merge anonymous → known)
- POST /api/v1/page — Page view events
- POST /api/v1/group — Group/company association

**Sources** (Session auth)
- GET/POST /api/v1/sources — List/create sources

**Destinations** (Session auth)
- GET/POST /api/v1/destinations — List/create destinations
- POST /api/v1/destinations/:id/test — Test delivery

**Profiles** (Session auth)
- GET /api/v1/profiles — List user profiles with search
- GET /api/v1/profiles/:user_id — Profile detail with event timeline

**Segments** (Session auth)
- GET/POST /api/v1/segments — List/create audience segments
- GET /api/v1/segments/:id/profiles — Profiles in segment

**Analytics** (Session auth)
- GET /api/v1/analytics/overview — Dashboard stats (events, profiles, sources, destinations)
- GET /api/v1/analytics/events — Event explorer with filters

**Compliance** (Session auth)
- GET /api/v1/compliance/gdpr/export — GDPR data export
- DELETE /api/v1/compliance/gdpr/delete — GDPR data deletion
- GET /api/v1/sovereignty — EU sovereignty attestation

### Dashboard Pages (21 files)
1. Landing page (hero, features, pricing, SDK snippet)
2. Auth: login ("Access Terminal"), register ("Initialize Pipeline")
3. Dashboard layout (amber sidebar)
4. Overview (event volume, active profiles, sources, destinations)
5. Events explorer (type filter, event name, user search, timeline)
6. Profiles (user list with traits, event count, last seen)
7. Profile detail (trait table, event timeline, segment membership)
8. Segments (audience list, rule builder)
9. Sources (list with write keys, SDK snippets)
10. Destinations (webhook/DB config, delivery status)
11. Settings (org, GDPR tools)
12. Admin (superuser cross-tenant stats)

### Pricing
| Plan | Price | Events/mo | Sources | Destinations |
|------|-------|-----------|---------|-------------|
| Free | €0 | 100,000 | 2 | 2 |
| Growth | €39 | 1,000,000 | 10 | 10 |
| Business | €99 | 10,000,000 | Unlimited | Unlimited |

### Differentiation vs Segment
- EU-sovereign: all data in EU, no CLOUD Act exposure
- Built-in consent management (GDPR category tracking)
- GDPR data export and deletion APIs as first-class features
- Machine-readable sovereignty attestation
- Transparent pricing (Segment hides pricing behind sales calls)
- No US service dependencies (no Twilio parent company)
