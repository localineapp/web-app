/**
 * @deprecated Moved to /api/sessions/[sessionId]
 * Issues a permanent redirect to the new canonical URL.
 */

import { NextRequest, NextResponse } from 'next/server';

export function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const match = request.nextUrl.pathname.match(/\/sessions\/([^/]+)$/);
  const sessionId = match?.[1];
  if (!sessionId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  void params;
  const url = new URL(`/api/sessions/${sessionId}`, request.url);
  return NextResponse.redirect(url, { status: 308 }); // 308 Permanent Redirect preserves the method
}
