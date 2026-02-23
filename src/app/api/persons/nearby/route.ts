import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/middleware/auth';
import { getPersonBySupabaseId } from '@/lib/services/personService';
import { findPersonsNearby } from '@/lib/services/proximityService';
import { getVisibleProfile } from '@/lib/services/privacyService';
import { cache, CACHE_TTL } from '@/lib/cache';
import { z } from 'zod';

/**
 * GET /api/persons/nearby?lat=X&lng=Y&radius=50&limit=20
 * Find persons nearby using PostGIS proximity search
 */

const searchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(10000).optional(), // Allow global search (999km)
  limit: z.coerce.number().min(1).max(100).optional(),
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
    const validationResult = searchSchema.safeParse({
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
      radius: searchParams.get('radius'),
      limit: searchParams.get('limit'),
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

    const { lat, lng, radius = 50, limit = 20 } = validationResult.data;

    // Create cache key based on search parameters
    const cacheKey = `nearby-persons:${person.id}:${lat}:${lng}:${radius}:${limit}`;

    // Check cache first (3 min TTL)
    const cachedPersons = cache.get<any[]>(cacheKey, CACHE_TTL.NEARBY_PERSONS);

    let nearbyPersons;
    if (cachedPersons !== null) {
      nearbyPersons = cachedPersons;
    } else {
      // Cache miss - query database
      nearbyPersons = await findPersonsNearby({
        latitude: lat,
        longitude: lng,
        radiusKm: radius,
        currentUserId: person.id,
        limit,
        userConnectionStyle: person.connectionStyle,
      });

      // Store in cache
      cache.set(cacheKey, nearbyPersons);
    }

    // Apply privacy filtering to each person (now with interests already fetched)
    const filteredPersons = nearbyPersons
      .map((nearbyPerson) => {
        try {
          // Apply privacy filtering directly to the fetched data
          // nearbyPerson already has interests from the SQL query
          const visibleProfile = getVisibleProfile(nearbyPerson as any, person.id);

          return {
            ...visibleProfile,
            distanceKm: nearbyPerson.distanceKm,
          };
        } catch (error) {
          // If privacy check fails (e.g., blocked), exclude this person
          console.log(`Privacy check failed for person ${nearbyPerson.id}:`, error);
          return null;
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    // Already filtered, no need for another filter
    const accessiblePersons = filteredPersons;

    return NextResponse.json({
      persons: accessiblePersons,
      count: accessiblePersons.length,
      searchParams: {
        latitude: lat,
        longitude: lng,
        radiusKm: radius,
        limit,
      },
    });
  } catch (error) {
    console.error('GET /api/persons/nearby error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
