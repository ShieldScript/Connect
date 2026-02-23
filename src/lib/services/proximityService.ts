import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Proximity Search Service
 * Uses PostGIS for geospatial queries
 */

export interface ProximitySearchParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  currentUserId: string;
  limit?: number;
}

export interface PersonNearby {
  id: string;
  displayName: string;
  profileImageUrl: string | null;
  bio: string | null;
  distanceKm: number;
  latitude: number | null;
  longitude: number | null;
  archetype: string | null;
  connectionStyle: string | null;
  blockedPersons: string[];
  interests?: Array<{
    id: string;
    interestId: string;
    personId: string;
    proficiencyLevel: string | null;
    interest: {
      id: string;
      name: string;
      category: string | null;
    };
  }>;
}

export interface GroupNearby {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  type: string;
  currentSize: number;
  maxSize: number | null;
  tags: string[];
  distanceKm: number;
  latitude: number | null;
  longitude: number | null;
  isVirtual: boolean;
  creatorName: string | null;
}

/**
 * Find persons within a radius using PostGIS
 */
export async function findPersonsNearby(
  params: ProximitySearchParams
): Promise<PersonNearby[]> {
  const { latitude, longitude, radiusKm, currentUserId, limit = 20 } = params;

  // Get current user's blocked list
  const currentUser = await prisma.person.findUnique({
    where: { id: currentUserId },
    select: { blockedPersons: true },
  });

  const blockedPersons = currentUser?.blockedPersons || [];

  // PostGIS proximity query with interests included via JOIN
  // Using ST_Distance for distance calculation and ST_DWithin for filtering
  const persons = await prisma.$queryRaw<any[]>`
    SELECT
      p.id,
      p."displayName",
      p."profileImageUrl",
      p.bio,
      p.latitude,
      p.longitude,
      p.archetype,
      p."connectionStyle",
      p."blockedPersons",
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', pi.id,
            'interestId', pi."interestId",
            'personId', pi."personId",
            'proficiencyLevel', pi."proficiencyLevel",
            'interest', jsonb_build_object(
              'id', i.id,
              'name', i.name,
              'category', i.category
            )
          )
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
      ) as interests,
      ST_Distance(
        p.location::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      ) / 1000 as "distanceKm"
    FROM "Person" p
    LEFT JOIN "PersonInterest" pi ON pi."personId" = p.id
    LEFT JOIN "Interest" i ON i.id = pi."interestId"
    WHERE
      p."onboardingLevel" >= 1
      AND ST_DWithin(
        p.location::geography,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radiusKm * 1000}
      )
      AND p.id != ${currentUserId}
      ${blockedPersons.length > 0 ? Prisma.sql`AND NOT (p.id = ANY(ARRAY[${Prisma.join(blockedPersons)}]::text[]))` : Prisma.empty}
      AND p.location IS NOT NULL
    GROUP BY p.id, p.location
    ORDER BY "distanceKm" ASC
    LIMIT ${limit}
  `;

  return persons.map((p) => ({
    ...p,
    distanceKm: Number(p.distanceKm), // Ensure it's a number
    interests: Array.isArray(p.interests) ? p.interests : [],
  }));
}

/**
 * Find groups within a radius using PostGIS
 */
export async function findGroupsNearby(
  latitude: number,
  longitude: number,
  radiusKm: number,
  filters?: {
    type?: string;
    tags?: string[];
    minSize?: number;
    maxSize?: number;
  },
  limit: number = 50
): Promise<GroupNearby[]> {
  // Build filter conditions for both physical and virtual groups
  const typeFilter = filters?.type ? Prisma.sql`AND g.type = ${filters.type}` : Prisma.empty;
  const minSizeFilter = filters?.minSize !== undefined ? Prisma.sql`AND g."currentSize" >= ${filters.minSize}` : Prisma.empty;
  const maxSizeFilter = filters?.maxSize !== undefined ? Prisma.sql`AND g."currentSize" <= ${filters.maxSize}` : Prisma.empty;

  // Query combines:
  // 1. Nearby physical groups (with location, within radius)
  // 2. All virtual groups (no location required, accessible from anywhere)
  const groups = await prisma.$queryRaw<GroupNearby[]>`
    SELECT
      g.id,
      g.name,
      g.description,
      g.protocol,
      g."imageUrl",
      g.type,
      g."locationName",
      g."currentSize",
      g."maxSize",
      g.tags,
      g.latitude,
      g.longitude,
      g."isVirtual",
      g.status,
      g."createdBy",
      p."displayName" as "creatorName",
      COALESCE(
        ST_Distance(
          g.location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) / 1000,
        9999
      ) as "distanceKm"
    FROM "Group" g
    LEFT JOIN "Person" p ON g."createdBy" = p.id
    WHERE
      g.status = 'ACTIVE'
      AND g."isPublic" = true
      AND g.category != 'HUDDLE'
      AND (
        (
          g."isVirtual" = false
          AND g.location IS NOT NULL
          AND ST_DWithin(
            g.location::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusKm * 1000}
          )
        )
        OR g."isVirtual" = true
      )
      ${typeFilter}
      ${minSizeFilter}
      ${maxSizeFilter}
    ORDER BY g."isVirtual" ASC, "distanceKm" ASC
    LIMIT ${limit}
  `;

  // Filter by tags if provided (post-query filtering for simplicity)
  let filteredGroups = groups;
  if (filters?.tags && filters.tags.length > 0) {
    filteredGroups = groups.filter((g) =>
      filters.tags!.some((tag) => g.tags.includes(tag))
    );
  }

  return filteredGroups.map((g) => ({
    ...g,
    distanceKm: Number(g.distanceKm),
  }));
}

/**
 * Calculate distance between two points using Haversine formula
 * (Fallback for when PostGIS is not available or for client-side calculations)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Update person's location and sync to PostGIS geography column
 */
export async function updatePersonLocation(
  personId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  // Note: PostGIS location column not yet created, so only updating lat/lng
  await prisma.$executeRaw`
    UPDATE "Person"
    SET
      latitude = ${latitude},
      longitude = ${longitude}
    WHERE id = ${personId}
  `;
}

/**
 * Update group's location and sync to PostGIS geography column
 */
export async function updateGroupLocation(
  groupId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  // Note: PostGIS location column not yet created, so only updating lat/lng
  await prisma.$executeRaw`
    UPDATE "Group"
    SET
      latitude = ${latitude},
      longitude = ${longitude}
    WHERE id = ${groupId}
  `;
}
