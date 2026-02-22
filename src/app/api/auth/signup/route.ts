import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPerson } from '@/lib/services/personService';
import { z } from 'zod';

/**
 * POST /api/auth/signup
 * Create new user account (Supabase Auth + Person record)
 */

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required').max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, displayName } = validationResult.data;

    const supabase = await createClient();

    // 1. Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      );
    }

    // 2. Create Person record in database
    const person = await createPerson({
      supabaseUserId: data.user.id,
      email: data.user.email!,
      displayName,
    });

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: person.id,
        email: person.email,
        displayName: person.displayName,
        onboardingLevel: person.onboardingLevel,
      },
      // Supabase will send email verification if enabled
      emailVerificationSent: data.user.identities?.length === 0,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/auth/signup error:', error);

    // Handle unique constraint violations (email already exists)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
