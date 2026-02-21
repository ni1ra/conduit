# CONDUIT

**EU-Sovereign Customer Data Platform**

Drop-in Segment replacement for EU companies. GDPR-native by architecture, not afterthought. Your customer data never leaves the European Union.

Production: [conduit-deploy.vercel.app](https://conduit-deploy.vercel.app)

---

## Why CONDUIT Exists

Segment was acquired by Twilio for $3.2B. Both are US-incorporated and subject to the CLOUD Act, which compels disclosure of data stored anywhere in the world to US authorities — even if that data belongs to EU citizens.

Customer Data Platforms route _all_ customer PII: behavioral events, purchase history, identity graphs, consent records. There is no EU-headquartered CDP. CONDUIT fills that gap.

All compute runs in Vercel's Frankfurt region (`fra1`). All data lives in Supabase PostgreSQL (`eu-west-1`, Frankfurt). Zero transatlantic data transfers. Full Schrems II compliance.

---

## Quick Start

### 1. Register an Organization

```bash
curl -X POST https://conduit-deploy.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@company.eu",
    "password": "your-secure-password",
    "org_name": "Acme GmbH"
  }'
```

Response includes your **write key** (`ck_...`). Store it securely — it won't be shown again.

### 2. Track Events

```bash
curl -X POST https://conduit-deploy.vercel.app/api/v1/track \
  -H "Content-Type: application/json" \
  -H "X-Conduit-Key: ck_your-write-key" \
  -d '{
    "event": "Purchase",
    "userId": "user-42",
    "properties": {
      "product": "EU Cloud Pro",
      "revenue": 99.00,
      "currency": "EUR"
    }
  }'
```

### 3. Client-Side SDK

```js
// Initialize
const conduit = {
  writeKey: "ck_your-write-key",
  endpoint: "https://conduit-deploy.vercel.app/api/v1",

  async track(event, properties = {}) {
    await fetch(`${this.endpoint}/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Conduit-Key": this.writeKey,
      },
      body: JSON.stringify({ event, properties, userId: this.userId }),
    });
  },

  async identify(userId, traits = {}) {
    this.userId = userId;
    await fetch(`${this.endpoint}/identify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Conduit-Key": this.writeKey,
      },
      body: JSON.stringify({ userId, traits }),
    });
  },
};

// Usage
conduit.identify("user-42", { name: "Max", plan: "growth" });
conduit.track("Purchase", { product: "EU Cloud Pro", revenue: 99.0 });
```

---

## Architecture

```
┌──────────────┐     ┌──────────────────────────────────────┐     ┌──────────────┐
│  JS SDK /    │     │         CONDUIT (SvelteKit 5)         │     │  PostgreSQL  │
│  HTTP API /  │────▶│  Vercel Serverless — Frankfurt (fra1) │────▶│  eu-west-1   │
│  Server SDK  │     │                                        │     │  (Supabase)  │
└──────────────┘     └──────────────────┬─────────────────────┘     └──────────────┘
                                        │
                          ┌─────────────┼─────────────┐
                          ▼             ▼             ▼
                     Webhooks     PostgreSQL       S3-compat
                   (destinations) (destinations)  (destinations)
```

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 5, Svelte 5 |
| Runtime | Node.js 22.x on Vercel (Frankfurt) |
| Database | PostgreSQL via `postgres.js` (Supabase eu-west-1) |
| Auth | bcryptjs (passwords), SHA-256 (write keys), httpOnly session cookies |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5.8 |

### Core Concepts

| Concept | Description |
|---------|------------|
| **Sources** | Where events originate — JS SDK, REST API, server-side libraries. Each source has its own write key. |
| **Events** | Track, Identify, Page, Group calls. Stored with full context, properties, and timestamps. |
| **Profiles** | Unified user records with identity resolution. Anonymous IDs merge into known users on identify. |
| **Segments** | Rule-based audience definitions evaluated against profile traits and event history. |
| **Destinations** | Where events fan out — webhooks, PostgreSQL databases, S3-compatible storage. Failures are isolated per destination. |
| **Consent** | Per-user, per-purpose consent tracking. Events tagged at collection time. |

---

## API Reference

Base URL: `https://conduit-deploy.vercel.app/api/v1`

### Authentication

Event ingestion endpoints use **write key auth**. Pass the key as either:
- `Authorization: Bearer ck_your-key`
- `X-Conduit-Key: ck_your-key`

Dashboard endpoints use **session cookies** set at login.

---

### Auth

#### POST /auth/register

Create a new tenant, user, and default source.

```json
{
  "email": "user@company.eu",
  "password": "min-8-chars",
  "org_name": "Acme GmbH",
  "name": "Optional Display Name"
}
```

Returns: user, tenant, source, and `write_key` (shown once).

#### POST /auth/login

Session-based login with brute force protection (5 attempts per IP per 15 minutes).

```json
{
  "email": "user@company.eu",
  "password": "your-password"
}
```

Returns: user object. Sets `conduit_session` httpOnly cookie.

#### GET /auth/me

Returns the currently authenticated user and tenant info.

#### GET /auth/logout

Revokes the session and clears the cookie.

---

### Event Ingestion (Write Key Auth)

#### POST /track

Track behavioral events. Supports single events and batch (up to 100).

```json
// Single event
{
  "event": "Purchase",
  "userId": "user-42",
  "anonymousId": "anon-abc",
  "properties": { "revenue": 99.00, "currency": "EUR" },
  "context": { "page": { "url": "https://example.eu/checkout" } },
  "timestamp": "2026-02-21T12:00:00Z"
}

// Batch
{
  "events": [
    { "event": "Page Viewed", "userId": "user-42" },
    { "event": "Button Clicked", "userId": "user-42", "properties": { "label": "Buy" } }
  ]
}
```

Also accepts a plain array `[{...}, {...}]` as the request body.

Field names accept both camelCase (`userId`) and snake_case (`user_id`).

Returns: `{ "accepted": true, "event_ids": [...], "count": N }`

#### POST /identify

Identify a user and merge traits. Links anonymous sessions to known users.

```json
{
  "userId": "user-42",
  "anonymousId": "anon-abc",
  "traits": {
    "name": "Max Müller",
    "email": "max@company.eu",
    "plan": "growth"
  }
}
```

Traits are merged (deep merge via `||` JSONB operator) — new traits are added, existing traits are updated, nothing is removed.

#### POST /page

Track page views.

```json
{
  "userId": "user-42",
  "name": "Pricing Page",
  "properties": { "url": "/pricing", "referrer": "https://google.com" }
}
```

#### POST /group

Associate a user with a group or company.

```json
{
  "userId": "user-42",
  "groupId": "company-7",
  "traits": { "name": "Acme GmbH", "industry": "SaaS", "employees": 50 }
}
```

---

### Sources (Session Auth)

#### GET /sources

List all sources for the current tenant.

#### POST /sources

Create a new source. Returns the new write key (shown once).

```json
{
  "name": "Mobile App",
  "type": "http"
}
```

---

### Destinations (Session Auth)

#### GET /destinations

List all destinations for the current tenant.

#### POST /destinations

Create a destination. Supported types: `webhook`, `postgres`, `s3`.

```json
{
  "name": "Analytics Warehouse",
  "type": "webhook",
  "config": { "url": "https://your-eu-service.eu/webhook", "headers": {} },
  "filter_events": ["Purchase", "Signup"]
}
```

---

### Profiles (Session Auth)

#### GET /profiles

List user profiles. Supports `?search=` query parameter.

#### GET /profiles/:userId

Profile detail including traits, anonymous IDs, event count, and recent event timeline.

---

### Segments (Session Auth)

#### GET /segments

List audience segments with profile counts.

#### POST /segments

Create a rule-based audience segment.

```json
{
  "name": "High-Value EU Customers",
  "description": "Users with revenue > €500",
  "rules": [
    { "field": "traits.total_revenue", "operator": "gt", "value": 500 }
  ]
}
```

---

### Analytics (Session Auth)

#### GET /analytics/overview

Dashboard statistics: 24h event count, total profiles, source count, destination count, segment count, top events by frequency, and daily trend data.

#### GET /analytics/events

Event explorer. Query params: `?type=track&event_name=Purchase&user_id=user-42`

---

### Compliance (Session Auth)

#### GET /compliance/gdpr/export

GDPR Article 15 — Right of Access. Export all data for a specific user or generate a tenant-wide summary.

Query param: `?user_id=user-42`

#### POST /compliance/gdpr/delete

GDPR Article 17 — Right to Erasure. Delete all data associated with a user. Creates an audit log entry.

```json
{
  "user_id": "user-42"
}
```

---

### Sovereignty

#### GET /sovereignty

Machine-readable EU sovereignty attestation. Returns jurisdiction, data residency, infrastructure locations, compliance status (GDPR, Schrems II, NIS2, ePrivacy), and data handling policies.

---

### Settings (Session Auth)

#### GET /settings

Current tenant settings and organization info.

---

### Admin (Superuser Only)

#### GET /admin/overview

Cross-tenant statistics: total tenants, users, events, sources, destinations. Lists all tenants and users. Requires `is_superuser = true`.

---

## Dashboard

The web dashboard is available at the root URL. It uses "The Wired" design language — amber/orange accent (`#ff8c00`), CRT scanlines, phosphor glow effects, monospace typography, true-black backgrounds.

### Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Hero, SDK snippet, 6 feature cards, 4-step how-it-works, 3 pricing tiers |
| Login | `/auth/login` | "Access Terminal" — session-based login |
| Register | `/auth/register` | "Initialize Pipeline" — creates org + user + source |
| Overview | `/dashboard` | 5 stat cards, top events table, daily trend chart |
| Events | `/dashboard/events` | Event explorer with type/name/user filters |
| Profiles | `/dashboard/profiles` | User list with search, click-through to detail |
| Profile Detail | `/dashboard/profiles/:id` | Traits, anonymous IDs, event timeline |
| Segments | `/dashboard/segments` | Audience segments with JSON rule builder |
| Sources | `/dashboard/sources` | Source list with write keys and SDK snippets |
| Destinations | `/dashboard/destinations` | Webhook/PostgreSQL/S3 destination config |
| Settings | `/dashboard/settings` | Org info, GDPR tools (Art. 15 export, Art. 17 deletion) |
| Admin | `/admin` | Superuser cross-tenant stats, tenant list, user list |

---

## Database Schema

All tables are prefixed with `conduit_` for namespace isolation. Full schema in `migrations/001_initial.sql`.

| Table | Purpose |
|-------|---------|
| `conduit_tenants` | Organizations (multi-tenant root) |
| `conduit_users` | Dashboard users with bcrypt passwords |
| `conduit_sessions` | Session tokens with expiry and revocation |
| `conduit_sources` | Event sources with SHA-256 hashed write keys |
| `conduit_destinations` | Outbound routing targets (webhook, postgres, s3) |
| `conduit_events` | All ingested events (track, identify, page, group) |
| `conduit_profiles` | Unified user profiles with identity resolution |
| `conduit_consent` | Per-user, per-purpose consent records |
| `conduit_segments` | Audience segment definitions and counts |
| `conduit_deliveries` | Destination delivery tracking |
| `conduit_audit_log` | GDPR audit trail for compliance actions |

Performance indexes cover event lookups by tenant, source, user, type, and event name. Profile lookups are indexed by tenant + user_id.

---

## Security

### Write Key Authentication
- Write keys are prefixed `ck_` and generated from 24 bytes of `crypto.randomBytes`
- Keys are hashed with SHA-256 before storage — the raw key is never persisted
- The raw key is returned exactly once on source creation

### Session Management
- Sessions use `crypto.randomUUID()` stored in PostgreSQL
- Cookie: `httpOnly`, `secure`, `sameSite: lax`, 24-hour expiry
- Sessions can be revoked (sets `revoked_at` timestamp)

### Brute Force Protection
- Login attempts tracked per IP address in memory
- 5 failed attempts triggers a 15-minute lockout per IP
- Successful login clears the attempt counter

### SQL Injection Prevention
- All queries use `postgres.js` tagged template literals — values are always parameterized, never interpolated into SQL strings

### Tenant Isolation
- Every database query filters by `tenant_id`
- No cross-tenant data access is possible through the API
- Superuser admin endpoints are gated by `is_superuser` flag

### GDPR Compliance
- **Article 15** (Right of Access): `/api/v1/compliance/gdpr/export` returns all stored data for a user
- **Article 17** (Right to Erasure): `/api/v1/compliance/gdpr/delete` removes all user data with audit logging
- **Consent Tracking**: Per-user, per-purpose consent records in `conduit_consent`
- **Audit Trail**: All compliance actions logged to `conduit_audit_log`

---

## Pricing

| Plan | Price | Events/mo | Sources | Destinations | Retention | Extras |
|------|-------|-----------|---------|--------------|-----------|--------|
| Free | €0 | 100,000 | 2 | 2 | 7 days | Community support |
| Growth | €39/mo | 1,000,000 | 10 | 10 | 90 days | Identity resolution, priority support |
| Business | €99/mo | 10,000,000 | Unlimited | Unlimited | 1 year | Audience segments, SSO/SAML, dedicated support |

No per-seat fees. No surprise overages. No sales calls required.

---

## Local Development

### Prerequisites

- Node.js 22+
- A PostgreSQL database (Supabase recommended)

### Setup

```bash
git clone <repo-url>
cd conduit-deploy
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, ADMIN_EMAIL, ENCRYPTION_KEY
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql://user:pass@host:6543/postgres?sslmode=require`) |
| `ADMIN_EMAIL` | Email address that gets superuser privileges on registration |
| `ENCRYPTION_KEY` | Key for sensitive data encryption |

### Database Migration

Run the initial schema against your PostgreSQL instance:

```bash
psql $DATABASE_URL -f migrations/001_initial.sql
```

### Run

```bash
npm run dev      # Development server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build locally
```

---

## Deployment

Deployed to Vercel with the SvelteKit Vercel adapter. Region is locked to `fra1` (Frankfurt) in `svelte.config.js`.

```js
adapter({
  runtime: 'nodejs22.x',
  regions: ['fra1']
})
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ENCRYPTION_KEY`

---

## Segment Migration

CONDUIT's API is designed for minimal migration effort from Segment:

| Segment | CONDUIT |
|---------|---------|
| `analytics.track()` | `POST /api/v1/track` |
| `analytics.identify()` | `POST /api/v1/identify` |
| `analytics.page()` | `POST /api/v1/page` |
| `analytics.group()` | `POST /api/v1/group` |
| Source write key | Source write key (same concept, `ck_` prefix) |
| Bearer auth | Bearer auth or `X-Conduit-Key` header |

Field names accept both Segment-style camelCase (`userId`, `anonymousId`) and snake_case (`user_id`, `anonymous_id`).

---

## EU Sovereignty

The `/api/v1/sovereignty` endpoint returns a machine-readable attestation:

```json
{
  "sovereignty": {
    "jurisdiction": "EU",
    "data_residency": "eu-west-1",
    "infrastructure": {
      "compute": "Vercel EU (Frankfurt/Amsterdam)",
      "database": "Supabase PostgreSQL (eu-west-1, Frankfurt)"
    },
    "compliance": {
      "gdpr": true,
      "schrems_ii": "No US data transfers for customer data. All CDP storage EU-only.",
      "nis2_ready": true,
      "eprivacy": "No tracking cookies. Server-side event collection only."
    },
    "us_service_dependencies": [],
    "third_party_analytics": false
  }
}
```

---

## License

Proprietary. All rights reserved.
