/**
 * POST /api/ai/hexaco-analysis
 *
 * Generate pure HEXACO personality analysis (no stewardship/calling context)
 * This is the "who you are" before "how you serve"
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateHexacoAnalysis } from '@/lib/services/hexacoAnalysisService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.hexacoScores || !body.archetype) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: hexacoScores and archetype',
        },
        { status: 400 }
      );
    }

    const { hexacoScores, archetype } = body;

    // Validate HEXACO scores structure
    const requiredDimensions = ['H', 'E', 'X', 'A', 'C', 'O'];
    for (const dim of requiredDimensions) {
      if (typeof hexacoScores[dim] !== 'number') {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid HEXACO scores: missing or invalid dimension ${dim}`,
          },
          { status: 400 }
        );
      }
    }

    // Generate HEXACO analysis
    const analysis = await generateHexacoAnalysis(hexacoScores, archetype);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error generating HEXACO analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate HEXACO analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
