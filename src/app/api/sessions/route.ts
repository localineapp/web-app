/**
 * GET /api/sessions
 *
 * Returns all active sessions for the authenticated user.
 * Sessions where both `expires` and `refreshExpires` are in the past are
 * excluded (they're dead weight that will be pruned on next access).
 *
 * Each item in the response is suitable for display in a security settings
 * page:
 *
 *   id             – session DB row identifier
 *   ipAddress      – client IP at session creation
 *   city / country – geolocation (populated when GEOIP_ENABLED=true)
 *   os / platform  – parsed from User-Agent at session creation
 *   userAgent      – raw User-Agent string
 *   createdAt      – when the session was first issued
 *   lastLogin      – last time the session was used
 *   expires        – token stops working for normal requests after this
 *   refreshExpires – token can no longer be refreshed after this
 *   isCurrent      – true when this is the calling request's session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, extractTokenFromRequest, hashSessionToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Identify the current session so the UI can mark it
    const rawToken = extractTokenFromRequest(request);
    const currentTokenHash = rawToken ? hashSessionToken(rawToken) : null;

    const now = new Date();

    const rows = await prisma.session.findMany({
      where: {
        userId: currentUser.userId,
        refreshExpires: { gt: now }, // exclude fully dead sessions
      },
      select: {
        id: true,
        ipAddress: true,
        city: true,
        country: true,
        os: true,
        platform: true,
        userAgent: true,
        createdAt: true,
        lastLogin: true,
        expires: true,
        refreshExpires: true,
        tokenHash: true,
      },
      orderBy: { lastLogin: 'desc' },
    });

    const sessions = rows.map(({ tokenHash, ...row }) => ({
      ...row,
      isCurrent: tokenHash === currentTokenHash,
    }));

    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
