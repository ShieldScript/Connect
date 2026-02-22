import { Person } from '@prisma/client';

/**
 * Privacy Service - Handles location privacy and profile visibility filtering
 */

export interface VisibleLocation {
  latitude: number;
  longitude: number;
}

/**
 * Get visible location based on privacy settings
 * @returns Location or null if hidden/blocked
 */
export function getVisibleLocation(
  person: Person,
  viewerId: string
): VisibleLocation | null {
  // Check if viewer is blocked
  if (person.blockedPersons.includes(viewerId)) {
    return null;
  }

  // Check if location data exists
  if (!person.latitude || !person.longitude) {
    return null;
  }

  // Default to approximate location (no locationPrivacy field in current schema)
  // Round to ~1km grid (0.01 degrees ≈ 1km)
  return {
    latitude: roundToGrid(person.latitude, 0.01),
    longitude: roundToGrid(person.longitude, 0.01),
  };
}

/**
 * Round coordinate to grid for privacy
 */
function roundToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Get visible profile data (removes sensitive fields)
 */
export function getVisibleProfile(person: any, viewerId: string) {
  // Check if blocked
  if (person.blockedPersons?.includes(viewerId)) {
    throw new Error('Profile not accessible');
  }

  // Get visible location
  const location = getVisibleLocation(person, viewerId);

  // Return filtered profile (no sensitive data)
  return {
    id: person.id,
    displayName: person.displayName,
    bio: person.bio,
    profileImageUrl: person.profileImageUrl,
    archetype: person.archetype,
    connectionStyle: person.connectionStyle,
    location,
    interests: person.interests?.map((pi: any) => ({
      id: pi.interest.id,
      name: pi.interest.name,
      category: pi.interest.category,
      proficiencyLevel: pi.proficiencyLevel,
    })),
    groups: person.memberships?.map((m: any) => ({
      id: m.group.id,
      name: m.group.name,
      type: m.group.type,
    })),
    // NEVER expose these:
    // - email
    // - supabaseUserId
    // - blockedPersons
    // - safetyFlags
    // - exact latitude/longitude (approximated above)
  };
}

/**
 * Calculate approximate distance for privacy
 * Returns rounded distance to avoid revealing exact location
 */
export function getApproximateDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return '< 1km away';
  } else if (distanceKm < 5) {
    return `~${Math.round(distanceKm)}km away`;
  } else if (distanceKm < 10) {
    return `~${Math.round(distanceKm / 5) * 5}km away`; // Round to nearest 5km
  } else if (distanceKm < 50) {
    return `~${Math.round(distanceKm / 10) * 10}km away`; // Round to nearest 10km
  } else {
    return '50+ km away';
  }
}
