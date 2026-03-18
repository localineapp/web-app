/**
 * @deprecated Moved to /api/sessions/[sessionId]
 * Issues a permanent redirect to the new canonical URL.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const url = new URL(`/api/sessions/${sessionId}`, request.url);
  return NextResponse.redirect(url, { status: 308 }); // 308 Permanent Redirect preserves the method
}
