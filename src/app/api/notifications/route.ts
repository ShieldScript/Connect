import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/notifications
 * Fetch user's notifications (last 50, unread first)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, person) => {
    const notifications = await prisma.notification.findMany({
      where: {
        personId: person.id,
      },
      orderBy: [
        { isRead: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 50,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        personId: person.id,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  }, { requireOnboarding: true });
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req, person) => {
    const body = await req.json();
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds must be an array' },
        { status: 400 }
      );
    }

    // Mark notifications as read (only user's own notifications)
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        personId: person.id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  }, { requireOnboarding: true });
}
