import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/middleware/auth';
import { getPersonById, getPersonBySupabaseId } from '@/lib/services/personService';
import { getVisibleProfile } from '@/lib/services/privacyService';

/**
 * GET /api/persons/:id
 * View another person's profile (privacy-filtered)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    // Get viewer's person record
    const viewer = await getPersonBySupabaseId(user.id);

    if (!viewer) {
      return NextResponse.json(
        { error: 'Viewer not found' },
        { status: 404 }
      );
    }

    // Get target person
    const { id } = await params;
    const person = await getPersonById(id);

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    // Apply privacy filtering
    try {
      const visibleProfile = getVisibleProfile(person, viewer.id);
      return NextResponse.json(visibleProfile);
    } catch (error) {
      if (error instanceof Error && error.message === 'Profile not accessible') {
        return NextResponse.json(
          { error: 'This profile is not accessible' },
          { status: 403 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('GET /api/persons/:id error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
