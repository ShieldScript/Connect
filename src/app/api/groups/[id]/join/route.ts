import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the person
    const person = await prisma.person.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    // Get the group
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if already a member
    const existingMembership = await prisma.groupMembership.findFirst({
      where: {
        groupId,
        personId: person.id,
      },
    });

    if (existingMembership) {
      if (existingMembership.status === 'ACTIVE') {
        return NextResponse.json({ error: 'Already a member' }, { status: 400 });
      }
      // Reactivate if previously left
      const updated = await prisma.groupMembership.update({
        where: { id: existingMembership.id },
        data: {
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });
      return NextResponse.json({ membership: updated });
    }

    // Check if group is full
    if (group.maxSize && group.currentSize >= group.maxSize) {
      return NextResponse.json({ error: 'Group is full' }, { status: 400 });
    }

    // Create membership and increment currentSize
    const [membership] = await prisma.$transaction([
      prisma.groupMembership.create({
        data: {
          groupId,
          personId: person.id,
          role: 'MEMBER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      }),
      prisma.group.update({
        where: { id: groupId },
        data: {
          currentSize: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ membership });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      { error: 'Failed to join group' },
      { status: 500 }
    );
  }
}
