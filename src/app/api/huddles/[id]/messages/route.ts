import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/huddles/[id]/messages
 * Fetch messages from a huddle (last 100)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, person) => {
    const { id } = await params;

    // 1. Verify active membership
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

    // 2. Verify it's a huddle
    const huddle = await prisma.group.findUnique({
      where: { id },
      select: { category: true },
    });

    if (!huddle || huddle.category !== 'HUDDLE') {
      return NextResponse.json(
        { error: 'This group is not a huddle' },
        { status: 400 }
      );
    }

    // 3. Fetch messages (last 100) without includes to avoid RLS issues
    const rawMessages = await prisma.huddleMessage.findMany({
      where: {
        huddleId: id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    // 4. Fetch sender data separately
    const senderIds = [...new Set(rawMessages.map(m => m.senderId))];
    const senders = await prisma.person.findMany({
      where: { id: { in: senderIds } },
      select: {
        id: true,
        displayName: true,
      },
    });

    // 5. Map senders by ID
    const senderMap = new Map(senders.map(s => [s.id, s]));

    // 6. Attach sender data to messages
    const messages = rawMessages
      .map(m => ({
        ...m,
        sender: senderMap.get(m.senderId) || { id: m.senderId, displayName: 'Unknown' },
      }))
      .filter(m => m.sender.displayName !== 'Unknown'); // Filter out messages with missing senders

    return NextResponse.json({ messages });
  }, { requireOnboarding: true });
}

/**
 * POST /api/huddles/[id]/messages
 * Send a message to a huddle
 */
const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, person) => {
    const { id } = await params;
    const body = await req.json();

    // Validate input
    const validationResult = sendMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { content } = validationResult.data;

    // 1. Verify active membership
    const membership = await prisma.groupMembership.findFirst({
      where: {
        groupId: id,
        personId: person.id,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be an active member to send messages' },
        { status: 403 }
      );
    }

    // 2. Verify it's a huddle
    const huddle = await prisma.group.findUnique({
      where: { id },
      select: { category: true },
    });

    if (!huddle || huddle.category !== 'HUDDLE') {
      return NextResponse.json(
        { error: 'This group is not a huddle' },
        { status: 400 }
      );
    }

    // 3. Create message (without include to avoid RLS issues)
    const newMessage = await prisma.huddleMessage.create({
      data: {
        huddleId: id,
        senderId: person.id,
        content: content.trim(),
      },
    });

    // 4. Attach sender data manually
    const message = {
      ...newMessage,
      sender: {
        id: person.id,
        displayName: person.displayName,
      },
    };

    return NextResponse.json({ message }, { status: 201 });
  }, { requireOnboarding: true });
}
