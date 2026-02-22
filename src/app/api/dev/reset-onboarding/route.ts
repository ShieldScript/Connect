import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const { personId } = await request.json();

    if (!personId) {
      return NextResponse.json(
        { error: 'personId is required' },
        { status: 400 }
      );
    }

    // Reset onboarding level to 0
    await prisma.person.update({
      where: { id: personId },
      data: {
        onboardingLevel: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding reset successfully',
    });
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to reset onboarding' },
      { status: 500 }
    );
  }
}
