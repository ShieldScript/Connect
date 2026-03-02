import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/onboarding/progress
 *
 * Returns current user's onboarding progress
 */
export async function GET() {
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

    // Fetch person with onboarding data
    const person = await prisma.person.findUnique({
      where: { supabaseUserId: user.id },
      select: {
        id: true,
        onboardingStep: true,
        onboardingComplete: true,
        displayName: true,
        bio: true,
        community: true,
        city: true,
        region: true,
        latitude: true,
        longitude: true,
        covenantAgreedAt: true,
      },
    });

    if (!person) {
      return NextResponse.json({
        success: true,
        data: {
          exists: false,
          currentStep: 1,
          onboardingComplete: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        exists: true,
        currentStep: person.onboardingStep,
        onboardingComplete: person.onboardingComplete,
        person: {
          displayName: person.displayName,
          bio: person.bio,
          community: person.community,
          city: person.city,
          region: person.region,
          latitude: person.latitude,
          longitude: person.longitude,
          covenantAgreed: !!person.covenantAgreedAt,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progress',
      },
      { status: 500 }
    );
  }
}
