import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/middleware/auth';
import { getPersonBySupabaseId } from '@/lib/services/personService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/groups/my-gatherings
 * Get all gatherings created by the current user
 */

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const person = await getPersonBySupabaseId(user.id);

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    // Get all gatherings created by this user
    const gatherings = await prisma.group.findMany({
      where: {
        createdBy: person.id,
      },
      include: {
        memberships: {
          include: {
            person: {
              select: {
                id: true,
                displayName: true,
                archetype: true,
                profileImageUrl: true,
              },
            },
          },
          where: {
            status: 'ACTIVE',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Separate active and archived
    const active = gatherings.filter(g => g.status === 'ACTIVE');
    const history = gatherings.filter(g => g.status === 'ARCHIVED' || g.status === 'PAUSED');

    // Calculate impact stats
    const totalReached = new Set(
      gatherings.flatMap(g => g.memberships.map(m => m.personId))
    ).size;

    const totalAttendance = gatherings.reduce((sum, g) => sum + g.currentSize, 0);
    const avgAttendance = gatherings.length > 0
      ? Math.round(totalAttendance / gatherings.length)
      : 0;

    return NextResponse.json({
      active,
      history,
      stats: {
        totalGatherings: gatherings.length,
        totalReached,
        avgAttendance,
      },
    });

  } catch (error) {
    console.error('GET /api/groups/my-gatherings error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
