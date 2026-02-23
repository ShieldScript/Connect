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

    // Fetch the group (without includes to avoid RLS issues)
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Gathering not found' },
        { status: 404 }
      );
    }

    // Fetch memberships and creator in parallel
    const [memberships, creator, distanceResult] = await Promise.all([
      // Fetch active memberships
      prisma.groupMembership.findMany({
        where: {
          groupId: group.id,
          status: 'ACTIVE',
        },
      }),
      // Fetch creator
      prisma.person.findUnique({
        where: { id: group.createdBy },
        select: { displayName: true, id: true },
      }),
      // Calculate distance if location exists
      (group.latitude && group.longitude && person.latitude && person.longitude)
        ? prisma.$queryRaw<Array<{ distanceKm: number }>>`
            SELECT ST_Distance(
              ST_SetSRID(ST_MakePoint(${group.longitude}, ${group.latitude}), 4326)::geography,
              ST_SetSRID(ST_MakePoint(${person.longitude}, ${person.latitude}), 4326)::geography
            ) / 1000 as "distanceKm"
          `
        : Promise.resolve(null)
    ]);

    // Fetch membership persons separately
    const memberPersonIds = memberships.map(m => m.personId);
    const memberPersons = memberPersonIds.length > 0
      ? await prisma.person.findMany({
          where: { id: { in: memberPersonIds } },
          select: { id: true, displayName: true, archetype: true },
        })
      : [];

    const memberPersonMap = new Map(memberPersons.map(p => [p.id, p]));

    // Map memberships with person data
    const enrichedMemberships = memberships.map(m => ({
      ...m,
      person: memberPersonMap.get(m.personId) || { id: m.personId, displayName: 'Unknown', archetype: null },
    }));

    const distanceKm = distanceResult?.[0]?.distanceKm || null;

    return NextResponse.json({
      group: {
        ...group,
        memberships: enrichedMemberships,
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
