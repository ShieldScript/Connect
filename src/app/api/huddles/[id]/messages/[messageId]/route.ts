import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/huddles/[id]/messages/[messageId]
 * Fetch a single message (for real-time subscription)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  return withAuth(request, async (req, person) => {
    const { id, messageId } = await params;

    // Verify membership
    const membership = await prisma.groupMembership.findFirst({
      where: {
        groupId: id,
        personId: person.id,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be an active member to view messages' },
        { status: 403 }
      );
    }

    // Fetch message
    const message = await prisma.huddleMessage.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!message || message.huddleId !== id) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message });
  }, { requireOnboarding: true });
}
