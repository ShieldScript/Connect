import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { updatePerson } from '@/lib/services/personService';
import { z } from 'zod';

/**
 * GET /api/persons/me
 * Get current user's profile with interests and active group memberships
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, person) => {
    // Return full profile (current user can see all their own data)
    return NextResponse.json({
      id: person.id,
      email: person.email,
      displayName: person.displayName,
      bio: person.bio,
      profileImageUrl: person.profileImageUrl,
      latitude: person.latitude,
      longitude: person.longitude,
      community: person.community,
      city: person.city,
      region: person.region,
      archetype: person.archetype,
      connectionStyle: person.connectionStyle,
      onboardingLevel: person.onboardingLevel,
      leadershipSignals: person.leadershipSignals,
      interests: person.interests.map((pi) => ({
        id: pi.interest.id,
        name: pi.interest.name,
        category: pi.interest.category,
        proficiencyLevel: pi.proficiencyLevel,
      })),
      groups: [], // TODO: Add when Group model is implemented
      lastActiveAt: person.lastActiveAt,
      createdAt: person.createdAt,
    });
  });
}

/**
 * PATCH /api/persons/me
 * Update current user's profile
 */

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  profileImageUrl: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationPrivacy: z.enum(['EXACT', 'APPROXIMATE', 'CITY_ONLY', 'HIDDEN']).optional(),
  proximityRadiusKm: z.number().min(1).max(200).optional(),
  ageRange: z.string().optional(),
  gender: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req, person) => {
    const body = await req.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Update person
    const updatedPerson = await updatePerson(person.id, validationResult.data);

    return NextResponse.json({
      id: updatedPerson.id,
      displayName: updatedPerson.displayName,
      bio: updatedPerson.bio,
      profileImageUrl: updatedPerson.profileImageUrl,
      latitude: updatedPerson.latitude,
      longitude: updatedPerson.longitude,
      locationPrivacy: updatedPerson.locationPrivacy,
      proximityRadiusKm: updatedPerson.proximityRadiusKm,
      ageRange: updatedPerson.ageRange,
      gender: updatedPerson.gender,
      updatedAt: updatedPerson.updatedAt,
    });
  });
}
