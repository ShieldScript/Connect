import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/middleware/auth';
import { getPersonBySupabaseId } from '@/lib/services/personService';
import { findGroupsNearby } from '@/lib/services/proximityService';
import { z } from 'zod';

/**
 * GET /api/groups/nearby?lat=X&lng=Y&radius=50&type=HOBBY&tags=hiking,outdoors&limit=20
 * Find groups nearby using PostGIS proximity search
 */

const searchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(10000).optional(), // Allow global search (999km)
  type: z.enum(['HOBBY', 'SUPPORT', 'SPIRITUAL', 'PROFESSIONAL', 'SOCIAL', 'OTHER']).nullable().optional(),
  tags: z.string().nullable().optional(), // Comma-separated tags
  minSize: z.coerce.number().min(1).optional(),
  maxSize: z.coerce.number().min(1).optional(),
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
      radius: searchParams.get('radius') || undefined,
      type: searchParams.get('type') || undefined,
      tags: searchParams.get('tags') || undefined,
      minSize: searchParams.get('minSize') || undefined,
      maxSize: searchParams.get('maxSize') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.issues);
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      lat,
      lng,
      radius = 50, // Default radius in km
      type,
      tags,
      minSize,
      maxSize,
      limit = 50,
    } = validationResult.data;

    // Parse tags if provided
    const tagArray = tags ? tags.split(',').map((t) => t.trim()) : undefined;

    // Find nearby groups
    const nearbyGroups = await findGroupsNearby(
      lat,
      lng,
      radius,
      {
        type: type || undefined,
        tags: tagArray,
        minSize,
        maxSize,
      },
      limit
    );

    return NextResponse.json({
      groups: nearbyGroups,
      count: nearbyGroups.length,
      searchParams: {
        latitude: lat,
        longitude: lng,
        radiusKm: radius,
        type,
        tags: tagArray,
        minSize,
        maxSize,
        limit,
      },
    });
  } catch (error) {
    console.error('GET /api/groups/nearby error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
