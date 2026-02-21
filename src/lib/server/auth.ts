import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import sql from './db';
import type { Cookies } from '@sveltejs/kit';

export function randomToken(bytes = 32): string {
	return randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function generateWriteKey(): string {
	return 'ck_' + randomToken(24);
}

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

export async function createSession(userId: number, tenantId: number, ipAddress?: string, userAgent?: string) {
	const sessionId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
	await sql`
		INSERT INTO conduit_sessions (id, user_id, tenant_id, expires_at, ip_address, user_agent)
		VALUES (${sessionId}, ${userId}, ${tenantId}, ${expiresAt}, ${ipAddress || null}, ${userAgent || null})
	`;
	return { sessionId, expiresAt };
}

export async function validateSession(cookies: Cookies) {
	const sessionId = cookies.get('conduit_session');
	if (!sessionId) return null;

	const [session] = await sql`
		SELECT s.id, s.user_id, s.tenant_id, s.expires_at,
			u.email, u.name, u.is_superuser, u.role,
			t.slug AS tenant_slug, t.name AS tenant_name
		FROM conduit_sessions s
		JOIN conduit_users u ON u.id = s.user_id
		JOIN conduit_tenants t ON t.id = s.tenant_id
		WHERE s.id = ${sessionId}
			AND s.expires_at > NOW()
			AND s.revoked_at IS NULL
			AND u.is_active = TRUE
	`;

	if (!session) return null;

	return {
		sessionId: session.id,
		userId: session.user_id,
		tenantId: session.tenant_id,
		email: session.email,
		name: session.name,
		isSuperuser: session.is_superuser,
		role: session.role,
		tenantSlug: session.tenant_slug,
		tenantName: session.tenant_name
	};
}

export async function revokeSession(sessionId: string) {
	await sql`UPDATE conduit_sessions SET revoked_at = NOW() WHERE id = ${sessionId}`;
}

export async function authenticateWriteKey(key: string | null) {
	if (!key) return null;
	const keyHash = hashToken(key);
	const [source] = await sql`
		SELECT s.id, s.tenant_id, s.name, s.slug, t.slug AS tenant_slug
		FROM conduit_sources s
		JOIN conduit_tenants t ON t.id = s.tenant_id
		WHERE s.write_key_hash = ${keyHash} AND s.is_active = TRUE
	`;
	return source ? { sourceId: source.id, tenantId: source.tenant_id, sourceName: source.name } : null;
}

export async function auditLog(params: { tenantId?: number; userId?: number; action: string; targetType?: string; targetId?: string; ipAddress?: string; metadata?: Record<string, unknown> }) {
	await sql`
		INSERT INTO conduit_audit_log (tenant_id, user_id, action, target_type, target_id, ip_address, metadata)
		VALUES (${params.tenantId || null}, ${params.userId || null}, ${params.action}, ${params.targetType || null}, ${params.targetId || null}, ${params.ipAddress || null}, ${JSON.stringify(params.metadata || {})}::jsonb)
	`;
}

// Brute force protection
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

export function checkBruteForce(ip: string): boolean {
	const entry = loginAttempts.get(ip);
	if (!entry) return true;
	if (Date.now() - entry.firstAttempt > 15 * 60 * 1000) {
		loginAttempts.delete(ip);
		return true;
	}
	return entry.count < 5;
}

export function recordFailedLogin(ip: string) {
	const entry = loginAttempts.get(ip);
	if (!entry) {
		loginAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
	} else {
		entry.count++;
	}
}

export function clearLoginAttempts(ip: string) {
	loginAttempts.delete(ip);
}
