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

    // Batch fetch all group details in a single query
    const groupIds = compatibilityResults.map(r => r.groupId);

    // Fetch groups separately to avoid RLS issues with includes
    const groups = await prisma.group.findMany({
      where: { id: { in: groupIds } },
    });

    // Fetch creators separately
    const creatorIds = groups.map(g => g.createdBy).filter((id): id is string => id !== null);
    const creators = await prisma.person.findMany({
      where: { id: { in: creatorIds } },
      select: { id: true, displayName: true, profileImageUrl: true },
    });

    // Fetch memberships separately
    const memberships = await prisma.groupMembership.findMany({
      where: {
        groupId: { in: groupIds },
        status: 'ACTIVE',
      },
      take: groupIds.length * 5, // Up to 5 members per group
    });

    // Fetch member persons separately
    const memberPersonIds = memberships.map(m => m.personId);
    const memberPersons = await prisma.person.findMany({
      where: { id: { in: memberPersonIds } },
      select: { id: true, displayName: true, profileImageUrl: true },
    });

    // Create lookup maps for O(1) access
    const groupMap = new Map(groups.map(g => [g.id, g]));
    const creatorMap = new Map(creators.map(c => [c.id, c]));
    const memberPersonMap = new Map(memberPersons.map(p => [p.id, p]));

    // Group memberships by groupId
    const membershipsByGroup = new Map<string, typeof memberships>();
    for (const membership of memberships) {
      const existing = membershipsByGroup.get(membership.groupId) || [];
      if (existing.length < 5) { // Limit to 5 members per group
        existing.push(membership);
        membershipsByGroup.set(membership.groupId, existing);
      }
    }

    // Map results using lookups
    const matches = compatibilityResults
      .map(result => {
        const group = groupMap.get(result.groupId);
        if (!group) return null;

        const creator = group.createdBy ? creatorMap.get(group.createdBy) : null;
        const groupMemberships = membershipsByGroup.get(result.groupId) || [];
        const members = groupMemberships
          .map(m => memberPersonMap.get(m.personId))
          .filter((p): p is NonNullable<typeof p> => p !== null);

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
            creator: creator || undefined,
            members,
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
      .filter((m): m is NonNullable<typeof m> => m !== null);

    const filteredMatches = matches;

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
