import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/middleware/auth';
import { getPersonBySupabaseId } from '@/lib/services/personService';
import { findCompatibleGroups } from '@/lib/services/compatibilityEngine';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/matches/groups?limit=20&minScore=0.3
 * Get recommended group matches based on compatibility
 */

const querySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  minScore: z.string().transform(Number).pipe(z.number().min(0).max(1)).optional(),
});

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

    // Check if person has completed onboarding
    if (person.onboardingLevel < 1) {
      return NextResponse.json(
        { error: 'Please complete onboarding first' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const validationResult = querySchema.safeParse({
      limit: searchParams.get('limit'),
      minScore: searchParams.get('minScore'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { limit = 20, minScore = 0.3 } = validationResult.data;

    // Find compatible groups
    const compatibilityResults = await findCompatibleGroups(person.id, {
      limit,
      minScore,
    });

    // Fetch full group details for each match
    const matches = await Promise.all(
      compatibilityResults.map(async (result) => {
        const group = await prisma.group.findUnique({
          where: { id: result.groupId },
          include: {
            creator: {
              select: {
                id: true,
                displayName: true,
                profileImageUrl: true,
              },
            },
            memberships: {
              where: { status: 'ACTIVE' },
              include: {
                person: {
                  select: {
                    id: true,
                    displayName: true,
                    profileImageUrl: true,
                  },
                },
              },
              take: 5, // Show first 5 members as preview
            },
          },
        });

        if (!group) return null;

        return {
          group: {
            id: group.id,
            name: group.name,
            description: group.description,
            imageUrl: group.imageUrl,
            type: group.type,
            tags: group.tags,
            currentSize: group.currentSize,
            maxSize: group.maxSize,
            isVirtual: group.isVirtual,
            latitude: group.latitude,
            longitude: group.longitude,
            creator: group.creator,
            members: group.memberships.map((m) => m.person),
            createdAt: group.createdAt,
          },
          interestScore: result.interestScore,
          proximityScore: result.proximityScore,
          sizeMatch: result.sizeMatch,
          typeMatch: result.typeMatch,
          overallScore: result.overallScore,
          matchReasons: result.matchReasons,
        };
      })
    );

    const filteredMatches = matches.filter((m): m is NonNullable<typeof m> => m !== null);

    return NextResponse.json({
      matches: filteredMatches,
      count: filteredMatches.length,
      searchParams: {
        limit,
        minScore,
      },
    });
  } catch (error) {
    console.error('GET /api/matches/groups error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
