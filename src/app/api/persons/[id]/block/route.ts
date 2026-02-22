import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/middleware/auth';
import { getPersonBySupabaseId, blockPerson } from '@/lib/services/personService';

/**
 * POST /api/persons/:id/block
 * Block another person
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    // Get current person
    const person = await getPersonBySupabaseId(user.id);

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    const { id: blockedId } = await params;

    // Can't block yourself
    if (blockedId === person.id) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      );
    }

    // Block the person
    await blockPerson(person.id, blockedId);

    return NextResponse.json({
      message: 'Person blocked successfully',
      blockedPersonId: blockedId,
    });
  } catch (error) {
    console.error('POST /api/persons/:id/block error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
