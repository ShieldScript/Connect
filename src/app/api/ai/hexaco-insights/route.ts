/**
 * POST /api/ai/hexaco-insights
 *
 * Regenerate HEXACO personality insights for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateHexacoInsights } from '@/lib/services/hexacoInsightsService';

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

    // Find the person
    const person = await prisma.person.findUnique({
      where: { supabaseUserId: user.id },
      select: {
        id: true,
        hexacoScores: true,
        hexacoArchetype: true,
      },
    });

    if (!person) {
      return NextResponse.json(
        {
          success: false,
          error: 'Person not found',
        },
        { status: 404 }
      );
    }

    if (!person.hexacoScores || !person.hexacoArchetype) {
      return NextResponse.json(
        {
          success: false,
          error: 'HEXACO assessment not completed',
        },
        { status: 400 }
      );
    }

    // Parse scores from JSON
    const scores = person.hexacoScores as {
      H: number;
      E: number;
      X: number;
      A: number;
      C: number;
      O: number;
    };

    // Generate new insights
    const insights = await generateHexacoInsights(scores, person.hexacoArchetype);

    // Update in database
    await prisma.person.update({
      where: { id: person.id },
      data: {
        hexacoInsights: insights,
        hexacoInsightsGeneratedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        insights,
        archetype: person.hexacoArchetype,
      },
    });
  } catch (error) {
    console.error('Error regenerating HEXACO insights:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to regenerate insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
