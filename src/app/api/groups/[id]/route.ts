import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/middleware/auth';
import { getPersonBySupabaseId } from '@/lib/services/personService';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/groups/[id]
 * Fetch a single gathering by ID
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const person = await getPersonBySupabaseId(user.id);

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    const { id: groupId } = await params;

    // Fetch the group with creator info
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          include: {
            person: {
              select: {
                id: true,
                displayName: true,
                archetype: true,
              },
            },
          },
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Gathering not found' },
        { status: 404 }
      );
    }

    // Calculate distance if location exists
    let distanceKm = null;
    if (group.latitude && group.longitude && person.latitude && person.longitude) {
      const result = await prisma.$queryRaw<Array<{ distanceKm: number }>>`
        SELECT ST_Distance(
          ST_SetSRID(ST_MakePoint(${group.longitude}, ${group.latitude}), 4326)::geography,
          ST_SetSRID(ST_MakePoint(${person.longitude}, ${person.latitude}), 4326)::geography
        ) / 1000 as "distanceKm"
      `;
      distanceKm = result[0]?.distanceKm || null;
    }

    // Get creator name
    const creator = await prisma.person.findUnique({
      where: { id: group.createdBy },
      select: { displayName: true },
    });

    return NextResponse.json({
      group: {
        ...group,
        distanceKm,
        creatorName: creator?.displayName || 'Unknown',
      },
    });

  } catch (error) {
    console.error('GET /api/groups/[id] error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/[id]
 * Update a gathering (creator only)
 */

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).nullable().optional(),
  protocol: z.string().max(500).nullable().optional(),
  maxSize: z.number().int().min(2).max(100).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const person = await getPersonBySupabaseId(user.id);

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    const { id: groupId } = await params;

    // Check if group exists and user is the creator
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Gathering not found' },
        { status: 404 }
      );
    }

    if (group.createdBy !== person.id) {
      return NextResponse.json(
        { error: 'Only the creator can modify this gathering' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = updateGroupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, description, protocol, maxSize, status } = validationResult.data;

    // Check if reducing capacity below current size
    if (maxSize && maxSize < group.currentSize) {
      return NextResponse.json(
        { error: `Cannot reduce capacity below current attendance (${group.currentSize})` },
        { status: 400 }
      );
    }

    // Update the group
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(protocol !== undefined && { protocol }),
        ...(maxSize !== undefined && { maxSize }),
        ...(status !== undefined && { status }),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Group updated:', updatedGroup.id);

    return NextResponse.json({
      message: 'Gathering updated successfully',
      group: updatedGroup,
    });

  } catch (error) {
    console.error('PATCH /api/groups/[id] error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * Cancel/delete a gathering (creator only)
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const person = await getPersonBySupabaseId(user.id);

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    const { id: groupId } = await params;

    // Check if group exists and user is the creator
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Gathering not found' },
        { status: 404 }
      );
    }

    if (group.createdBy !== person.id) {
      return NextResponse.json(
        { error: 'Only the creator can delete this gathering' },
        { status: 403 }
      );
    }

    // Delete the group (cascade will delete memberships)
    await prisma.group.delete({
      where: { id: groupId },
    });

    console.log('✅ Group deleted:', groupId);

    return NextResponse.json({
      message: 'Gathering canceled successfully',
    });

  } catch (error) {
    console.error('DELETE /api/groups/[id] error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
