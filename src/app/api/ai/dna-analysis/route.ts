/**
 * POST /api/ai/dna-analysis
 *
 * Generate comprehensive DNA analysis showing how HEXACO aligns with Stewardship/Calling
 * This is the "crown jewel" reveal at the end of onboarding
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { generateDNAAnalysis } from '@/lib/services/dnaAnalysisService';

export async function POST(request: NextRequest) {
  try {
    // Get data from request body (for onboarding) or database (for logged-in users)
    const body = await request.json();

    let hexacoScores: {
      H: number;
      E: number;
      X: number;
      A: number;
      C: number;
      O: number;
    };
    let archetype: string;
    let stewardshipData: any;

    // If data provided in body (onboarding flow)
    if (body.hexacoScores && body.archetype) {
      hexacoScores = body.hexacoScores;
      archetype = body.archetype;
      stewardshipData = {
        naturalGiftings: body.naturalGiftings || [],
        supernaturalGiftings: body.supernaturalGiftings || [],
        ministryExperiences: body.ministryExperiences || [],
        practices: body.practices || [],
        leadershipPatterns: body.leadershipPatterns || [],
        callings: body.callings || [],
      };
    } else {
      // Fetch from database for logged-in users
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'No data provided and user not authenticated',
          },
          { status: 401 }
        );
      }

      const person = await prisma.person.findUnique({
        where: { supabaseUserId: user.id },
        select: {
          id: true,
          hexacoScores: true,
          hexacoArchetype: true,
          naturalGiftings: {
            select: {
              type: true,
              level: true,
            },
          },
          supernaturalGiftings: {
            select: {
              type: true,
              level: true,
            },
          },
          ministryExperiences: {
            select: {
              type: true,
              level: true,
            },
          },
          practices: {
            select: {
              type: true,
              frequency: true,
            },
          },
          leadershipPatterns: {
            select: {
              style: true,
              frequency: true,
            },
          },
          callings: {
            select: {
              type: true,
              clarity: true,
            },
          },
        },
      });

      if (!person || !person.hexacoScores || !person.hexacoArchetype) {
        return NextResponse.json(
          {
            success: false,
            error: 'Person not found or HEXACO not completed',
          },
          { status: 404 }
        );
      }

      hexacoScores = person.hexacoScores as any;
      archetype = person.hexacoArchetype;
      stewardshipData = {
        naturalGiftings: person.naturalGiftings.map((g) => ({
          type: g.type,
          level: g.level,
        })),
        supernaturalGiftings: person.supernaturalGiftings.map((g) => ({
          type: g.type,
          level: g.level,
        })),
        ministryExperiences: person.ministryExperiences.map((m) => ({
          type: m.type,
          level: m.level,
        })),
        practices: person.practices.map((p) => ({
          type: p.type,
          frequency: p.frequency,
        })),
        leadershipPatterns: person.leadershipPatterns.map((l) => ({
          style: l.style,
          frequency: l.frequency,
        })),
        callings: person.callings.map((c) => ({
          type: c.type,
          clarity: c.clarity,
        })),
      };
    }

    // Generate DNA analysis
    const analysis = await generateDNAAnalysis(
      hexacoScores,
      archetype,
      stewardshipData
    );

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error generating DNA analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate DNA analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
