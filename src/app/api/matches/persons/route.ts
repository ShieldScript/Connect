import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import {
  findCompatiblePersons,
  getCachedCompatibilityScores,
  type MatchReason,
} from '@/lib/services/compatibilityEngine';
import { getVisibleProfile } from '@/lib/services/privacyService';
import { z } from 'zod';
import type { Person, PersonInterest, Interest } from '@prisma/client';

// Type for Person with interests included from Prisma query
type PersonWithInterests = Person & {
  interests: Array<PersonInterest & { interest: Interest }>;
};

// Match result structure
interface MatchResult {
  person: PersonWithInterests;
  interestSimilarity: number;
  proximityScore: number;
  overallScore: number;
  matchReasons: MatchReason[];
  calculatedAt: Date;
}

/**
 * GET /api/matches/persons?limit=20&useCache=true&minScore=0.3
 * Get recommended person matches based on compatibility
 */

const querySchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  useCache: z.string().transform((val) => val === 'true').optional(),
  minScore: z.string().transform(Number).pipe(z.number().min(0).max(1)).optional(),
});

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, person) => {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const validationResult = querySchema.safeParse({
      limit: searchParams.get('limit'),
      useCache: searchParams.get('useCache'),
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

    const { limit = 20, useCache = true, minScore = 0.3 } = validationResult.data;

    let matches: MatchResult[];

    if (useCache) {
      // Try to get cached scores first (faster)
      matches = await getCachedCompatibilityScores(person.id, limit);

      // If cache is empty or stale, calculate fresh matches
      if (matches.length === 0) {
        console.log('Cache miss, calculating fresh matches');
        const compatibilityResults = await findCompatiblePersons(person.id, {
          limit,
          minScore,
        });

        // FIX: Batch fetch all matched persons in a single query (no N+1)
        const personIds = compatibilityResults.map(r => r.personId);
        const matchedPersons = await prisma.person.findMany({
          where: { id: { in: personIds } },
          include: {
            interests: {
              include: {
                interest: true,
              },
            },
          },
        });

        // Create a map for O(1) lookup
        const personMap = new Map(matchedPersons.map(p => [p.id, p]));

        // Convert compatibility results to match format
        matches = compatibilityResults
          .map((result) => {
            const matchedPerson = personMap.get(result.personId);
            if (!matchedPerson) return null;

            return {
              person: matchedPerson as any, // Prisma types don't match exactly with our PersonMatchResult
              interestSimilarity: result.interestSimilarity,
              proximityScore: result.proximityScore,
              overallScore: result.overallScore,
              matchReasons: result.matchReasons,
              calculatedAt: new Date(),
            };
          })
          .filter((m): m is NonNullable<typeof m> => m !== null);
      }
    } else {
      // Always calculate fresh matches
      const compatibilityResults = await findCompatiblePersons(person.id, {
        limit,
        minScore,
      });

      // FIX: Batch fetch all matched persons in a single query (no N+1)
      const personIds = compatibilityResults.map(r => r.personId);
      const matchedPersons = await prisma.person.findMany({
        where: { id: { in: personIds } },
        include: {
          interests: {
            include: {
              interest: true,
            },
          },
        },
      });

      // Create a map for O(1) lookup
      const personMap = new Map(matchedPersons.map(p => [p.id, p]));

      // Convert compatibility results to match format
      matches = compatibilityResults
        .map((result) => {
          const matchedPerson = personMap.get(result.personId);
          if (!matchedPerson) return null;

          return {
            person: matchedPerson,
            interestSimilarity: result.interestSimilarity,
            proximityScore: result.proximityScore,
            overallScore: result.overallScore,
            matchReasons: result.matchReasons,
            calculatedAt: new Date(),
          };
        })
        .filter((m): m is NonNullable<typeof m> => m !== null);
    }

    // Apply privacy filtering to each matched person
    const filteredMatches = matches
      .map((match) => {
        try {
          const visibleProfile = getVisibleProfile(match.person, person.id);

          return {
            person: visibleProfile,
            interestSimilarity: match.interestSimilarity,
            proximityScore: match.proximityScore,
            overallScore: match.overallScore,
            matchReasons: match.matchReasons,
            calculatedAt: match.calculatedAt,
          };
        } catch (error) {
          // If privacy check fails (e.g., blocked), exclude this match
          return null;
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);

    return NextResponse.json({
      matches: filteredMatches,
      count: filteredMatches.length,
      cached: useCache && filteredMatches.length > 0,
      searchParams: {
        limit,
        minScore,
        useCache,
      },
    });
  }, { requireOnboarding: true });
}
