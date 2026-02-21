/**
 * Logout API endpoint
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, revokeSession, removeSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (token) {
      await revokeSession(token);
    } else {
      await removeSessionCookie();
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
