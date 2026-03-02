import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/onboarding/save
 *
 * Save onboarding progress for current step
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, data } = body;

    // Find or create person
    let person = await prisma.person.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!person) {
      // Create new person record
      person = await prisma.person.create({
        data: {
          supabaseUserId: user.id,
          email: user.email!,
          displayName: data.displayName || 'New User',
          onboardingStep: step,
        },
      });
    } else {
      // Update onboarding step
      await prisma.person.update({
        where: { id: person.id },
        data: {
          onboardingStep: Math.max(step, person.onboardingStep),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        personId: person.id,
        currentStep: step,
      },
    });
  } catch (error) {
    console.error('Error saving onboarding progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save progress',
      },
      { status: 500 }
    );
  }
}
