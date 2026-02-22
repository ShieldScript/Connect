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

    // 3. Fetch messages (last 100)
    const messages = await prisma.huddleMessage.findMany({
      where: {
        huddleId: id,
        deletedAt: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

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

    // 3. Create message
    const message = await prisma.huddleMessage.create({
      data: {
        huddleId: id,
        senderId: person.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  }, { requireOnboarding: true });
}
