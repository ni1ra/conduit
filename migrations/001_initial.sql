-- CONDUIT: EU-Sovereign Customer Data Platform
-- Migration 001: Initial schema

CREATE TABLE IF NOT EXISTS conduit_tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conduit_users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES conduit_tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member',
    is_superuser BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conduit_sessions (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES conduit_users(id),
    tenant_id INTEGER NOT NULL REFERENCES conduit_tenants(id),
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conduit_sources (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES conduit_tenants(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    write_key_hash VARCHAR(64) NOT NULL,
    type VARCHAR(50) DEFAULT 'javascript',
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS conduit_destinations (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES conduit_tenants(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    filter_events TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conduit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id INTEGER NOT NULL REFERENCES conduit_tenants(id),
    source_id INTEGER NOT NULL REFERENCES conduit_sources(id),
    type VARCHAR(20) NOT NULL,
    event_name VARCHAR(255),
    anonymous_id VARCHAR(255),
    user_id VARCHAR(255),
    properties JSONB DEFAULT '{}',
    context JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conduit_profiles (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES conduit_tenants(id),
    user_id VARCHAR(255) NOT NULL,
    anonymous_ids TEXT[] DEFAULT '{}',
    traits JSONB DEFAULT '{}',
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    event_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS conduit_consent (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES conduit_tenants(id),
    profile_id INTEGER NOT NULL REFERENCES conduit_profiles(id),
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, category)
);

CREATE TABLE IF NOT EXISTS conduit_segments (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES conduit_tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rules JSONB DEFAULT '[]',
    profile_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conduit_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id INTEGER NOT NULL REFERENCES conduit_tenants(id),
    destination_id INTEGER NOT NULL REFERENCES conduit_destinations(id),
    event_id UUID NOT NULL REFERENCES conduit_events(id),
    status VARCHAR(20) DEFAULT 'pending',
    response_code INTEGER,
    error TEXT,
    delivered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS conduit_audit_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id INTEGER,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(255),
    ip_address VARCHAR(45),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_conduit_events_tenant ON conduit_events(tenant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conduit_events_source ON conduit_events(source_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conduit_events_user ON conduit_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conduit_events_type ON conduit_events(type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conduit_events_name ON conduit_events(event_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conduit_profiles_tenant ON conduit_profiles(tenant_id, last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_conduit_profiles_user ON conduit_profiles(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_conduit_deliveries_dest ON conduit_deliveries(destination_id, delivered_at DESC);
CREATE INDEX IF NOT EXISTS idx_conduit_sessions_user ON conduit_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conduit_audit_tenant ON conduit_audit_log(tenant_id, created_at DESC);
