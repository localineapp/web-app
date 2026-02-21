/**
 * DELETE /api/sessions/[sessionId]
 *
 * Revokes a specific session by its database row ID.
 *
 * Users may only revoke sessions that belong to them.
 * Revoking the current session is allowed and equivalent to logging out
 * (the session cookie is cleared automatically).
 *
 * Response on success (200):
 *   { message: "Session revoked." }
 *
 * Errors:
 *   401 – caller is not authenticated
 *   403 – session belongs to a different user
 *   404 – session not found
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentUser,
  extractTokenFromRequest,
  hashSessionToken,
  removeSessionCookie,
} from '@/lib/auth';
import { cacheDelete } from '@/lib/session-cache';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { sessionId } = await params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, tokenHash: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Evict from cache and delete from DB
    await cacheDelete(`session:${session.tokenHash}`);
    await prisma.session.delete({ where: { id: sessionId } });

    // If the caller is revoking their own current session, clear the cookie too
    const rawToken = extractTokenFromRequest(request);
    if (rawToken && hashSessionToken(rawToken) === session.tokenHash) {
      await removeSessionCookie();
    }

    return NextResponse.json({ message: 'Session revoked.' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
