/**
 * @deprecated Moved to /api/sessions
 * These handlers issue permanent redirects to keep existing clients working
 * during the transition period.
 */

import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const url = new URL('/api/sessions', request.url);
  return NextResponse.redirect(url, { status: 301 });
}

export function DELETE(request: NextRequest) {
  // Can't transparently redirect a DELETE body, so return 410 Gone with instructions
  void request;
  return NextResponse.json(
    {
      error: 'This endpoint has moved.',
      details: 'Use DELETE /api/sessions/{id} to revoke a specific session, or POST /api/auth/logout to log out.',
    },
    { status: 410 },
  );
}


