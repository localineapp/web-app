/**
 * Authentication & Session management
 *
 * Sessions are stored in the database (Session table) and optionally cached
 * via the session-cache layer (in-process Map or Redis).
 *
 * Token transport
 * ---------------
 * Primary   – Authorization: Bearer <token>       (API clients / SPAs)
 * Secondary – httpOnly cookie "session_id"         (browser convenience)
 *
 * Both mechanisms carry the exact same opaque bearer token
 * (format: "sess_<base64url-32-bytes>").  The server always stores only the
 * SHA-256 hash; the raw token never touches the database.
 *
 * Two-window expiry
 * -----------------
 * expires        (14 days)  – token is valid for normal authenticated requests
 * refreshExpires (30 days)  – token can still be rotated via POST /api/sessions/refresh
 *                             even after `expires` has passed
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { cacheGet, cacheSet, cacheDelete } from '@/lib/session-cache';
import { parseUserAgent } from '@/lib/ua-parser';
import { getGeoInfo } from '@/lib/geo';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_COOKIE_NAME = 'session_id';

/** Normal session lifetime – requests are accepted within this window. */
const SESSION_EXPIRES_SECONDS =
  (parseInt(process.env.SESSION_EXPIRES_DAYS ?? '', 10) || 14) * 24 * 60 * 60;

/** Extended refresh window – token can be rotated until this deadline. */
const SESSION_REFRESH_EXPIRES_SECONDS =
  (parseInt(process.env.SESSION_REFRESH_EXPIRES_DAYS ?? '', 10) || 30) * 24 * 60 * 60;

const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// Feature flags
// ---------------------------------------------------------------------------

/**
 * Whether new user sign-ups are allowed.
 * Set SIGNUPS_ENABLED=false in the environment to disable.
 */
export function areSignupsEnabled(): boolean {
  return process.env.SIGNUPS_ENABLED !== 'false';
}

// ---------------------------------------------------------------------------
// Password helpers
// ---------------------------------------------------------------------------

/** Hash a plain-text password for storage (bcrypt). */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** Verify a plain-text password against a stored bcrypt hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/** Generate a cryptographically random, URL-safe session bearer token. */
function generateSessionToken(): string {
  return 'sess_' + crypto.randomBytes(32).toString('base64url');
}

/**
 * Compute the SHA-256 hex digest of a session token.
 * This is the only value we persist; the raw token lives exclusively in the
 * client cookie / Authorization header.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal payload attached to every authenticated request. */
export interface SessionPayload {
  userId: string;
  email: string;
  /** DB row id – use this to identify the current session in the sessions list. */
  sessionId: string;
}

/** What `issueSession` returns to the caller. */
export interface SessionIssueResult {
  /** Raw bearer token – write to Authorization header or store client-side. */
  token: string;
  /** ISO timestamp – token stops working for normal requests after this. */
  expires: string;
  /** ISO timestamp – token can no longer be refreshed after this. */
  refreshExpires: string;
}

// ---------------------------------------------------------------------------
// Extract raw token from a NextRequest
// ---------------------------------------------------------------------------

/**
 * Pull the raw session token out of an incoming request.
 * Checks the Authorization header first (Bearer scheme), then the cookie.
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    const candidate = auth.substring(7);
    if (candidate.startsWith('sess_')) return candidate;
  }
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

// ---------------------------------------------------------------------------
// Core: issue_session
// ---------------------------------------------------------------------------

/**
 * Create a new session row, set the httpOnly cookie, and return the token.
 *
 * Enriches the session with parsed UA (os, platform) and optional geo data
 * (city, country) gathered from the incoming request.
 */
export async function issueSession(
  userId: string,
  email: string,
  request?: NextRequest,
): Promise<SessionIssueResult> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const sessionId = uuidv4();

  const now = Date.now();
  const expires = new Date(now + SESSION_EXPIRES_SECONDS * 1000);
  const refreshExpires = new Date(now + SESSION_REFRESH_EXPIRES_SECONDS * 1000);

  // Extract request metadata
  const ipAddress = request
    ? (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        null)
    : null;

  const rawUa = request ? (request.headers.get('user-agent') ?? null) : null;
  const { os, platform } = parseUserAgent(rawUa);
  const { city, country } = await getGeoInfo(ipAddress);

  await prisma.session.create({
    data: {
      id: sessionId,
      tokenHash,
      userId,
      ipAddress,
      city,
      country,
      os,
      platform,
      userAgent: rawUa?.slice(0, 512) ?? null,
      expires,
      refreshExpires,
    },
  });

  // Prime the cache so the first request after login requires no DB round-trip
  const payload: SessionPayload = { userId, email, sessionId };
  await cacheSet(`session:${tokenHash}`, payload, Math.min(SESSION_EXPIRES_SECONDS, 300));

  // Set browser cookie (secondary transport)
  await setSessionCookie(token, SESSION_REFRESH_EXPIRES_SECONDS);

  return {
    token,
    expires: expires.toISOString(),
    refreshExpires: refreshExpires.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Core: DBSession::get
// ---------------------------------------------------------------------------

/**
 * Validate a session token and return its payload.
 *
 * Pipeline: cache → database.  On a DB hit the `lastLogin` timestamp is
 * updated in the background (non-blocking) and the cache is repopulated.
 *
 * Returns null when the token is missing, not found, or past `expires`.
 * Tokens that are past `expires` but within `refreshExpires` are rejected
 * here – they may only be used via `refreshSession`.
 */
export async function getSession(token: string): Promise<SessionPayload | null> {
  const tokenHash = hashSessionToken(token);
  const cacheKey = `session:${tokenHash}`;

  // 1. Fast path: cache hit
  const cached = await cacheGet<SessionPayload>(cacheKey);
  if (cached) return cached;

  // 2. Database lookup
  const row = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expires: true,
      user: { select: { email: true } },
    },
  });

  if (!row) return null;

  // Reject past the normal expiry (use refreshSession if within refreshExpires)
  if (row.expires < new Date()) {
    // Async cleanup if also past refreshExpires – fire-and-forget
    prisma.session
      .findUnique({ where: { tokenHash }, select: { refreshExpires: true } })
      .then((r) => {
        if (r && r.refreshExpires < new Date()) {
          prisma.session.delete({ where: { tokenHash } }).catch(() => null);
        }
      })
      .catch(() => null);

    return null;
  }

  // Slide lastLogin (fire-and-forget)
  prisma.session
    .update({ where: { tokenHash }, data: { lastLogin: new Date() } })
    .catch(() => null);

  const payload: SessionPayload = {
    userId: row.userId,
    email: row.user.email,
    sessionId: row.id,
  };

  // Repopulate cache (5-minute TTL keeps things fresh without hammering DB)
  await cacheSet(cacheKey, payload, 300);
  return payload;
}

// ---------------------------------------------------------------------------
// Core: session/refresh  (token rotation)
// ---------------------------------------------------------------------------

/**
 * Rotate a session: delete the old row and issue a fresh one for the same user.
 *
 * Accepts tokens that are past `expires` but still within `refreshExpires`.
 * Returns null (instead of throwing) when the token is fully expired or
 * simply not found.
 */
export async function refreshSession(
  token: string,
  request?: NextRequest,
): Promise<SessionIssueResult | null> {
  const tokenHash = hashSessionToken(token);

  // Fetch the full row so we can check refreshExpires and get the userId
  const row = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      refreshExpires: true,
      user: { select: { email: true } },
    },
  });

  if (!row) return null;

  // Token is no longer refreshable
  if (row.refreshExpires < new Date()) {
    prisma.session.delete({ where: { tokenHash } }).catch(() => null);
    return null;
  }

  // Evict the old session
  await cacheDelete(`session:${tokenHash}`);
  await prisma.session.delete({ where: { tokenHash } }).catch(() => null);

  // Issue a brand-new session for the same user
  return issueSession(row.userId, row.user.email, request);
}

// ---------------------------------------------------------------------------
// Core: session/{id} revoke
// ---------------------------------------------------------------------------

/**
 * Revoke a session by its **raw bearer token**.
 *
 * Removes the DB row, evicts the cache, and clears the browser cookie if
 * this was the current session.
 */
export async function revokeSession(token: string): Promise<void> {
  const tokenHash = hashSessionToken(token);
  await cacheDelete(`session:${tokenHash}`);
  await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => null);
  await removeSessionCookie();
}

/**
 * Revoke all sessions for a user (e.g. on password change or account actions).
 *
 * @param keepTokenHash - SHA-256 hash of a single session to spare
 *                        (keep the caller logged in on the current device).
 */
export async function revokeAllUserSessions(
  userId: string,
  keepTokenHash?: string,
): Promise<void> {
  const rows = await prisma.session.findMany({
    where: { userId },
    select: { tokenHash: true },
  });

  const toEvict = keepTokenHash
    ? rows.filter((r) => r.tokenHash !== keepTokenHash)
    : rows;

  await Promise.all(toEvict.map((r) => cacheDelete(`session:${r.tokenHash}`)));

  await prisma.session.deleteMany({
    where: {
      userId,
      ...(keepTokenHash ? { tokenHash: { not: keepTokenHash } } : {}),
    },
  });
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

export async function setSessionCookie(token: string, maxAge = SESSION_REFRESH_EXPIRES_SECONDS): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
}

/** Read the raw session token **from the cookie store** (server components / layouts). */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

/** Clear the session cookie. */
export async function removeSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

// ---------------------------------------------------------------------------
// getCurrentUser – used by all route handlers
// ---------------------------------------------------------------------------

/**
 * Return the session payload for the currently authenticated request, or null.
 *
 * Resolution order:
 *   1. `Authorization: Bearer sess_…` header  (when `request` is provided)
 *   2. `session_id` httpOnly cookie            (always checked as fallback)
 */
export async function getCurrentUser(request?: NextRequest): Promise<SessionPayload | null> {
  // Priority 1: Authorization header (API / SPA clients)
  if (request) {
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const candidate = auth.substring(7);
      if (candidate.startsWith('sess_')) {
        const payload = await getSession(candidate);
        if (payload) return payload;
      }
    }
  }

  // Priority 2: httpOnly cookie (browser)
  const cookieToken = await getSessionToken();
  if (cookieToken) return getSession(cookieToken);

  return null;
}

// ---------------------------------------------------------------------------
// API key utilities (unchanged)
// ---------------------------------------------------------------------------

/** Generate a random API key with a "tk_" prefix. */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'tk_';
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/** Hash an API key for storage (bcrypt). */
export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, SALT_ROUNDS);
}

/** Verify a raw API key against its stored bcrypt hash. */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(apiKey, hash);
}

