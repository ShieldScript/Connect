import { prisma } from '@/lib/prisma';
import { calculateDistance } from './proximityService';

/**
 * Compatibility Matching Engine
 * Rule-based algorithm for MVP (AI embeddings in Phase 2)
 */

export interface PersonWithInterests {
  id: string;
  latitude: number | null;
  longitude: number | null;
  interests: { interest: { id: string; name: string; category: string }; proficiencyLevel: number }[];
  groupPreferences: any;
  personalityTraits: any;
}

export interface CompatibilityResult {
  personId: string;
  interestSimilarity: number; // 0-1
  proximityScore: number; // 0-1
  personalityMatch: number; // 0-1
  overallScore: number; // Weighted average
  matchReasons: MatchReason[];
}

export interface MatchReason {
  type: 'interest' | 'proximity' | 'personality' | 'group_preference';
  value: string;
  score?: number;
}

export interface GroupWithTags {
  id: string;
  name: string;
  type: string;
  tags: string[];
  latitude: number | null;
  longitude: number | null;
  currentSize: number;
}

export interface GroupCompatibilityResult {
  groupId: string;
  interestScore: number; // 0-1
  proximityScore: number; // 0-1
  sizeMatch: number; // 0-1
  typeMatch: number; // 0-1
  overallScore: number;
  matchReasons: MatchReason[];
}

/**
 * Calculate compatibility between two persons
 */
export function calculatePersonCompatibility(
  person1: PersonWithInterests,
  person2: PersonWithInterests
): CompatibilityResult {
  // 1. Interest Similarity (Jaccard Index)
  const interests1 = new Set(person1.interests.map((i) => i.interest.id));
  const interests2 = new Set(person2.interests.map((i) => i.interest.id));
  const intersection = new Set([...interests1].filter((x) => interests2.has(x)));
  const union = new Set([...interests1, ...interests2]);
  const interestSimilarity = union.size > 0 ? intersection.size / union.size : 0;

  // 2. Proximity Score (inverse distance, max 50km)
  let proximityScore = 0;
  if (
    person1.latitude &&
    person1.longitude &&
    person2.latitude &&
    person2.longitude
  ) {
    const distance = calculateDistance(
      person1.latitude,
      person1.longitude,
      person2.latitude,
      person2.longitude
    );
    // Closer = higher score (50km = 0, 0km = 1)
    proximityScore = Math.max(0, Math.min(1, 1 - distance / 50));
  }

  // 3. Personality Match (openness similarity)
  let personalityMatch = 0.5; // Default neutral
  const openness1 = person1.personalityTraits?.openness || 5;
  const openness2 = person2.personalityTraits?.openness || 5;
  // Closer openness = better match (max difference is 9, normalized to 0-1)
  const opennessDiff = Math.abs(openness1 - openness2);
  personalityMatch = 1 - opennessDiff / 9;

  // 4. Weighted Overall Score
  const weights = {
    interest: 0.5, // Interest overlap most important
    proximity: 0.3, // Proximity second
    personality: 0.2, // Personality compatibility third
  };

  const overallScore =
    interestSimilarity * weights.interest +
    proximityScore * weights.proximity +
    personalityMatch * weights.personality;

  // 5. Generate Match Reasons
  const matchReasons: MatchReason[] = [];

  // Shared interests (top 3)
  const sharedInterests = person1.interests.filter((i1) =>
    person2.interests.some((i2) => i2.interest.id === i1.interest.id)
  );
  sharedInterests.slice(0, 3).forEach((interest) => {
    matchReasons.push({
      type: 'interest',
      value: interest.interest.name,
      score: interestSimilarity,
    });
  });

  // Proximity
  if (
    person1.latitude &&
    person1.longitude &&
    person2.latitude &&
    person2.longitude
  ) {
    const distance = calculateDistance(
      person1.latitude,
      person1.longitude,
      person2.latitude,
      person2.longitude
    );

    if (distance < 10) {
      matchReasons.push({
        type: 'proximity',
        value: `${distance.toFixed(1)}km away`,
        score: proximityScore,
      });
    }
  }

  // Personality
  if (personalityMatch > 0.7) {
    matchReasons.push({
      type: 'personality',
      value: 'Similar personality traits',
      score: personalityMatch,
    });
  }

  return {
    personId: person2.id,
    interestSimilarity,
    proximityScore,
    personalityMatch,
    overallScore,
    matchReasons,
  };
}

/**
 * Find compatible persons for a given person
 */
export async function findCompatiblePersons(
  personId: string,
  options: {
    limit?: number;
    minScore?: number;
    radiusKm?: number;
  } = {}
): Promise<CompatibilityResult[]> {
  const { limit = 20, minScore = 0.3, radiusKm = 50 } = options;

  // 1. Get current person with interests
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      interests: {
        include: { interest: true },
      },
    },
  });

  if (!person || !person.latitude || !person.longitude) {
    return [];
  }

  // 2. Get all onboarded persons (excluding self and blocked)
  const candidatePersons = await prisma.person.findMany({
    where: {
      id: { not: personId },
      onboardingLevel: { gte: 1 },
      latitude: { not: null },
      longitude: { not: null },
      NOT: [
        {
          id: { in: person.blockedPersons },
        },
        // Also exclude persons who have blocked this user
        {
          blockedPersons: { has: personId },
        },
      ],
    },
    include: {
      interests: {
        include: { interest: true },
      },
    },
    take: 200, // Get more candidates, then filter by score
  });

  // 3. Calculate compatibility for each
  const compatibilityScores = candidatePersons
    .map((candidate) => {
      // Type guard for latitude/longitude
      if (!candidate.latitude || !candidate.longitude) return null;

      return calculatePersonCompatibility(
        {
          id: person.id,
          latitude: person.latitude,
          longitude: person.longitude,
          interests: person.interests,
          groupPreferences: person.groupPreferences,
          personalityTraits: person.personalityTraits,
        },
        {
          id: candidate.id,
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          interests: candidate.interests,
          groupPreferences: candidate.groupPreferences,
          personalityTraits: candidate.personalityTraits,
        }
      );
    })
    .filter((result): result is CompatibilityResult => result !== null);

  // 4. Filter by minimum score and sort by overall score
  const filteredScores = compatibilityScores
    .filter((score) => score.overallScore >= minScore)
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, limit);

  return filteredScores;
}

/**
 * Calculate compatibility between a person and a group
 */
export function calculateGroupCompatibility(
  person: PersonWithInterests,
  group: GroupWithTags
): GroupCompatibilityResult {
  // 1. Interest/Tag Overlap
  const personInterestNames = new Set(
    person.interests.map((i) => i.interest.name.toLowerCase())
  );
  const groupTags = new Set(group.tags.map((t) => t.toLowerCase()));
  const intersection = new Set([...personInterestNames].filter((x) => groupTags.has(x)));
  const interestScore =
    personInterestNames.size > 0 ? intersection.size / personInterestNames.size : 0;

  // 2. Proximity Score
  let proximityScore = 0;
  if (person.latitude && person.longitude && group.latitude && group.longitude) {
    const distance = calculateDistance(
      person.latitude,
      person.longitude,
      group.latitude,
      group.longitude
    );
    proximityScore = Math.max(0, Math.min(1, 1 - distance / 50));
  }

  // 3. Size Preference Match
  const prefs = person.groupPreferences as any;
  const sizeMin = prefs?.sizeMin || 2;
  const sizeMax = prefs?.sizeMax || 100;
  const sizeMatch =
    group.currentSize >= sizeMin && group.currentSize <= sizeMax ? 1 : 0.5;

  // 4. Type Match (if person has type preference)
  const preferredTypes = prefs?.types || [];
  const typeMatch =
    preferredTypes.length === 0 || preferredTypes.includes(group.type) ? 1 : 0.5;

  // 5. Weighted Overall Score
  const weights = {
    interest: 0.4,
    proximity: 0.3,
    size: 0.2,
    type: 0.1,
  };

  const overallScore =
    interestScore * weights.interest +
    proximityScore * weights.proximity +
    sizeMatch * weights.size +
    typeMatch * weights.type;

  // 6. Generate Match Reasons
  const matchReasons: MatchReason[] = [];

  // Shared interests/tags
  const sharedTags = [...intersection];
  if (sharedTags.length > 0) {
    matchReasons.push({
      type: 'interest',
      value: sharedTags.slice(0, 3).join(', '),
      score: interestScore,
    });
  }

  // Proximity
  if (person.latitude && person.longitude && group.latitude && group.longitude) {
    const distance = calculateDistance(
      person.latitude,
      person.longitude,
      group.latitude,
      group.longitude
    );

    if (distance < 10) {
      matchReasons.push({
        type: 'proximity',
        value: `${distance.toFixed(1)}km away`,
        score: proximityScore,
      });
    }
  }

  // Size match
  if (sizeMatch === 1) {
    matchReasons.push({
      type: 'group_preference',
      value: `${group.currentSize} members (in your preferred range)`,
      score: sizeMatch,
    });
  }

  return {
    groupId: group.id,
    interestScore,
    proximityScore,
    sizeMatch,
    typeMatch,
    overallScore,
    matchReasons,
  };
}

/**
 * Find compatible groups for a person
 */
export async function findCompatibleGroups(
  personId: string,
  options: {
    limit?: number;
    minScore?: number;
    radiusKm?: number;
  } = {}
): Promise<GroupCompatibilityResult[]> {
  const { limit = 20, minScore = 0.3, radiusKm = 50 } = options;

  // 1. Get person with interests and preferences
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      interests: {
        include: { interest: true },
      },
    },
  });

  if (!person || !person.latitude || !person.longitude) {
    return [];
  }

  // 2. Get active, public groups nearby
  const candidateGroups = await prisma.group.findMany({
    where: {
      status: 'ACTIVE',
      isPublic: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    take: 200, // Get more candidates, then filter by score
  });

  // 3. Calculate compatibility for each group
  const compatibilityScores = candidateGroups
    .map((group) => {
      if (!group.latitude || !group.longitude) return null;

      return calculateGroupCompatibility(
        {
          id: person.id,
          latitude: person.latitude,
          longitude: person.longitude,
          interests: person.interests,
          groupPreferences: person.groupPreferences,
          personalityTraits: person.personalityTraits,
        },
        {
          id: group.id,
          name: group.name,
          type: group.type,
          tags: group.tags,
          latitude: group.latitude,
          longitude: group.longitude,
          currentSize: group.currentSize,
        }
      );
    })
    .filter((result): result is GroupCompatibilityResult => result !== null);

  // 4. Filter by minimum score and sort by overall score
  const filteredScores = compatibilityScores
    .filter((score) => score.overallScore >= minScore)
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, limit);

  return filteredScores;
}

/**
 * Batch calculate and cache compatibility scores
 * (Called after onboarding or on daily refresh)
 */
export async function cacheCompatibilityScores(personId: string): Promise<void> {
  // Find compatible persons
  const personMatches = await findCompatiblePersons(personId, { limit: 50 });

  // Store in CompatibilityScore table
  if (personMatches.length > 0) {
    await prisma.compatibilityScore.createMany({
      data: personMatches.map((match) => ({
        personId,
        matchedPersonId: match.personId,
        interestSimilarity: match.interestSimilarity,
        proximityScore: match.proximityScore,
        overallScore: match.overallScore,
        matchReasons: match.matchReasons.map(r => `${r.type}: ${r.value}`),
        calculatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })),
      skipDuplicates: true,
    });
  }
}

/**
 * Get cached compatibility scores (faster than recalculating)
 */
export async function getCachedCompatibilityScores(
  personId: string,
  limit: number = 20
): Promise<any[]> {
  const cachedScores = await prisma.compatibilityScore.findMany({
    where: {
      personId,
      expiresAt: { gt: new Date() }, // Not expired
    },
    orderBy: { overallScore: 'desc' },
    take: limit,
  });

  // TODO: Fetch matched persons separately since relation is not in schema
  // For now, return empty array to avoid build errors
  // This means cached matches won't work until the schema is updated
  return [];
}
