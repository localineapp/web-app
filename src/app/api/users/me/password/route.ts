/**
 * Password Change API
 * POST /api/users/me/password - Change user password
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword, extractTokenFromRequest, hashSessionToken, revokeAllUserSessions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// POST /api/users/me/password
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body: ChangePasswordRequest = await request.json();

    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isValidPassword = await verifyPassword(body.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    const newPasswordHash = await hashPassword(body.newPassword);
    await prisma.user.update({
      where: { id: currentUser.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Keep the current session active; revoke all others
    const currentToken = extractTokenFromRequest(request);
    const keepTokenHash = currentToken ? hashSessionToken(currentToken) : undefined;
    await revokeAllUserSessions(currentUser.userId, keepTokenHash);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. All other active sessions have been invalidated. Your current session remains valid.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
