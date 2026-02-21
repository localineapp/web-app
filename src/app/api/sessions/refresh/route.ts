/**
 * POST /api/sessions/refresh
 *
 * Rotates the caller's session: the current session is deleted and a brand-new
 * one is issued with fresh `expires` and `refreshExpires` timestamps.
 *
 * This endpoint intentionally accepts tokens that are past `expires` but
 * still within `refreshExpires`, enabling a typical sliding-window flow:
 *
 *   1. Client stores token + refreshExpires from login/signup response.
 *   2. When the token is rejected with 401, client hits this endpoint.
 *   3. If refreshExpires has not passed, a new token is returned.
 *   4. Client replaces the old token and retries the original request.
 *   5. Once refreshExpires passes, the user must log in again.
 *
 * Request body: none required (token read from Authorization header or cookie)
 *
 * Response on success (200):
 *   { session: { token, expires, refreshExpires } }
 *
 * Response on failure:
 *   401 – no token present or refreshExpires has passed
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, refreshSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: 'No session token provided' }, { status: 401 });
    }

    const result = await refreshSession(token, request);

    if (!result) {
      return NextResponse.json(
        { error: 'Session expired or not found. Please log in again.' },
        { status: 401 },
      );
    }

    return NextResponse.json({ session: result });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
