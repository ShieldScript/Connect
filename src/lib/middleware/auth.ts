import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPersonBySupabaseId } from '@/lib/services/personService';
import type { Person, PersonInterest, Interest } from '@prisma/client';

// Type for Person with interests relation
export type PersonWithInterests = Person & {
  interests: Array<PersonInterest & { interest: Interest }>;
};

/**
 * Authentication middleware for API routes
 * Verifies Supabase JWT token and returns authenticated user
 */
export async function requireAuth(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      error: 'Unauthorized',
      status: 401,
    };
  }

  return {
    user,
    error: null,
    status: 200,
  };
}

/**
 * Helper to get current user or throw error
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Options for withAuth middleware
 */
export interface WithAuthOptions {
  requireOnboarding?: boolean;
}

/**
 * Higher-order function that wraps API route handlers with authentication
 * and person lookup logic. Eliminates code duplication across routes.
 *
 * @param handler - The route handler that receives the request and authenticated person
 * @param options - Configuration options (e.g., requireOnboarding)
 * @returns Response from the handler or an error response
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   return withAuth(request, async (req, person) => {
 *     // Your route logic here with authenticated person
 *     return NextResponse.json({ data: person });
 *   }, { requireOnboarding: true });
 * }
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, person: PersonWithInterests) => Promise<Response>,
  options: WithAuthOptions = {}
): Promise<Response> {
  try {
    // Get authenticated user
    const user = await getCurrentUser();

    // Get person from database
    const person = await getPersonBySupabaseId(user.id);

    if (!person) {
      return NextResponse.json(
        { error: 'Person profile not found. Please complete signup.' },
        { status: 404 }
      );
    }

    // Check onboarding requirement
    if (options.requireOnboarding && person.onboardingLevel < 1) {
      return NextResponse.json(
        { error: 'Please complete onboarding first', redirect: '/onboarding' },
        { status: 422 }
      );
    }

    // Call the handler with authenticated person
    return await handler(request as NextRequest, person);
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log unexpected errors
    console.error('withAuth error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
