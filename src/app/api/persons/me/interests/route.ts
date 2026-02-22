import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/middleware/auth';
import { getPersonBySupabaseId, addPersonInterests } from '@/lib/services/personService';
import { z } from 'zod';

/**
 * POST /api/persons/me/interests
 * Add/update interests for current user
 */

const addInterestsSchema = z.object({
  interestIds: z.array(z.string().uuid()).min(1, 'At least one interest required').max(20, 'Maximum 20 interests'),
  proficiencyLevel: z.number().min(1).max(5).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    const person = await getPersonBySupabaseId(user.id);

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = addInterestsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { interestIds, proficiencyLevel } = validationResult.data;

    // Add interests (replaces existing)
    await addPersonInterests(person.id, interestIds, proficiencyLevel || 3);

    // Fetch updated person with interests
    const updatedPerson = await getPersonBySupabaseId(user.id);

    return NextResponse.json({
      message: 'Interests updated successfully',
      interests: updatedPerson?.interests.map((pi) => ({
        id: pi.interest.id,
        name: pi.interest.name,
        category: pi.interest.category,
        proficiencyLevel: pi.proficiencyLevel,
      })),
    });
  } catch (error) {
    console.error('POST /api/persons/me/interests error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
