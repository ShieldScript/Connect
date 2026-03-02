import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { calculateHexacoScores, getArchetype } from '@/lib/hexacoScoring';
import { generateHexacoInsights } from '@/lib/services/hexacoInsightsService';

interface OnboardingData {
  displayName: string;
  bio: string;
  community: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
  interests: Array<{
    type: string;
    proficiency: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  hexacoResponses?: Record<string, number>;
  naturalGiftings: Array<{
    type: string;
    level: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  supernaturalGiftings: Array<{
    type: string;
    level: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  ministryExperiences: Array<{
    type: string;
    level: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  milestones: Array<{
    type: string;
    significance: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
    description?: string;
  }>;
  growthAreas: Array<{
    type: string;
    level: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  leadershipPatterns: Array<{
    style: string;
    frequency: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  lifeStages: Array<{
    type: string;
    stage: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  callings: Array<{
    type: string;
    clarity: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  healingThemes: Array<{
    type: string;
    progress: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  practices: Array<{
    type: string;
    frequency: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
  boundaries: Array<{
    type: string;
    availability: number;
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
    customValue?: string;
  }>;
}

/**
 * POST /api/onboarding/complete
 *
 * Complete onboarding and save all data
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

    const data: OnboardingData = await request.json();

    // Calculate HEXACO scores if responses provided
    let hexacoScores = null;
    let hexacoArchetype = null;
    let hexacoInsights = null;
    if (data.hexacoResponses && Object.keys(data.hexacoResponses).length === 60) {
      const responsesMap = new Map(
        Object.entries(data.hexacoResponses).map(([k, v]) => [parseInt(k), v])
      );
      hexacoScores = calculateHexacoScores(responsesMap);
      if (hexacoScores) {
        hexacoArchetype = getArchetype(hexacoScores);

        // Generate AI insights (async, non-blocking)
        try {
          hexacoInsights = await generateHexacoInsights(hexacoScores, hexacoArchetype);
        } catch (error) {
          console.error('Failed to generate HEXACO insights:', error);
          // Continue without insights - not critical to onboarding flow
        }
      }
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Create or update person
      const person = await tx.person.upsert({
        where: { supabaseUserId: user.id },
        create: {
          supabaseUserId: user.id,
          email: user.email!,
          displayName: data.displayName,
          bio: data.bio,
          community: data.community,
          city: data.city,
          region: data.region,
          latitude: data.latitude,
          longitude: data.longitude,
          hexacoResponses: data.hexacoResponses || null,
          hexacoScores: hexacoScores || null,
          hexacoArchetype: hexacoArchetype,
          hexacoCompletedAt: hexacoScores ? new Date() : null,
          hexacoInsights: hexacoInsights,
          hexacoInsightsGeneratedAt: hexacoInsights ? new Date() : null,
          onboardingStep: 18,
          onboardingComplete: true,
          covenantAgreedAt: new Date(),
        },
        update: {
          displayName: data.displayName,
          bio: data.bio,
          community: data.community,
          city: data.city,
          region: data.region,
          latitude: data.latitude,
          longitude: data.longitude,
          hexacoResponses: data.hexacoResponses || null,
          hexacoScores: hexacoScores || null,
          hexacoArchetype: hexacoArchetype,
          hexacoCompletedAt: hexacoScores ? new Date() : null,
          hexacoInsights: hexacoInsights,
          hexacoInsightsGeneratedAt: hexacoInsights ? new Date() : null,
          onboardingStep: 18,
          onboardingComplete: true,
          covenantAgreedAt: new Date(),
        },
      });

      // Update location geography if coordinates provided
      if (data.latitude && data.longitude) {
        await tx.$executeRawUnsafe(
          `UPDATE "Person" SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3`,
          data.longitude,
          data.latitude,
          person.id
        );
      }

      // Clear existing data (in case of re-onboarding)
      await tx.personInterest.deleteMany({ where: { personId: person.id } });
      await tx.personNaturalGifting.deleteMany({ where: { personId: person.id } });
      await tx.personSupernaturalGifting.deleteMany({ where: { personId: person.id } });
      await tx.personMinistryExperience.deleteMany({ where: { personId: person.id } });
      await tx.personMilestone.deleteMany({ where: { personId: person.id } });
      await tx.personGrowthArea.deleteMany({ where: { personId: person.id } });
      await tx.personLeadershipPattern.deleteMany({ where: { personId: person.id } });
      await tx.personLifeStage.deleteMany({ where: { personId: person.id } });
      await tx.personCalling.deleteMany({ where: { personId: person.id } });
      await tx.personHealingTheme.deleteMany({ where: { personId: person.id } });
      await tx.personPractice.deleteMany({ where: { personId: person.id } });
      await tx.personBoundary.deleteMany({ where: { personId: person.id } });

      // Create interests
      if (data.interests?.length > 0) {
        await tx.personInterest.createMany({
          data: data.interests.map((interest) => ({
            personId: person.id,
            type: interest.type as any,
            customValue: interest.customValue,
            proficiency: interest.proficiency,
            privacy: interest.privacy,
          })),
        });
      }

      // Create natural giftings
      if (data.naturalGiftings?.length > 0) {
        await tx.personNaturalGifting.createMany({
          data: data.naturalGiftings.map((gift) => ({
            personId: person.id,
            type: gift.type as any,
            customName: gift.customValue,
            level: gift.level,
            privacy: gift.privacy,
          })),
        });
      }

      // Create supernatural giftings
      if (data.supernaturalGiftings?.length > 0) {
        await tx.personSupernaturalGifting.createMany({
          data: data.supernaturalGiftings.map((gift) => ({
            personId: person.id,
            type: gift.type as any,
            customName: gift.customValue,
            level: gift.level,
            privacy: gift.privacy,
          })),
        });
      }

      // Create ministry experiences
      if (data.ministryExperiences?.length > 0) {
        await tx.personMinistryExperience.createMany({
          data: data.ministryExperiences.map((exp) => ({
            personId: person.id,
            type: exp.type as any,
            customName: exp.customValue,
            level: exp.level,
            privacy: exp.privacy,
          })),
        });
      }

      // Create milestones
      if (data.milestones?.length > 0) {
        await tx.personMilestone.createMany({
          data: data.milestones.map((ms) => ({
            personId: person.id,
            type: ms.type as any,
            customName: ms.customValue,
            description: ms.description,
            significance: ms.significance,
            privacy: ms.privacy,
          })),
        });
      }

      // Create growth areas
      if (data.growthAreas?.length > 0) {
        await tx.personGrowthArea.createMany({
          data: data.growthAreas.map((area) => ({
            personId: person.id,
            type: area.type as any,
            customName: area.customValue,
            level: area.level,
            privacy: area.privacy,
          })),
        });
      }

      // Create leadership patterns
      if (data.leadershipPatterns?.length > 0) {
        await tx.personLeadershipPattern.createMany({
          data: data.leadershipPatterns.map((pattern) => ({
            personId: person.id,
            style: pattern.style as any,
            customName: pattern.customValue,
            frequency: pattern.frequency,
            privacy: pattern.privacy,
          })),
        });
      }

      // Create life stages
      if (data.lifeStages?.length > 0) {
        await tx.personLifeStage.createMany({
          data: data.lifeStages.map((stage) => ({
            personId: person.id,
            type: stage.type as any,
            customName: stage.customValue,
            stage: stage.stage,
            privacy: stage.privacy,
          })),
        });
      }

      // Create callings
      if (data.callings?.length > 0) {
        await tx.personCalling.createMany({
          data: data.callings.map((calling) => ({
            personId: person.id,
            type: calling.type as any,
            customName: calling.customValue,
            clarity: calling.clarity,
            privacy: calling.privacy,
          })),
        });
      }

      // Create healing themes
      if (data.healingThemes?.length > 0) {
        await tx.personHealingTheme.createMany({
          data: data.healingThemes.map((theme) => ({
            personId: person.id,
            type: theme.type as any,
            customName: theme.customValue,
            progress: theme.progress,
            privacy: theme.privacy,
          })),
        });
      }

      // Create practices
      if (data.practices?.length > 0) {
        await tx.personPractice.createMany({
          data: data.practices.map((practice) => ({
            personId: person.id,
            type: practice.type as any,
            customName: practice.customValue,
            frequency: practice.frequency,
            privacy: practice.privacy,
          })),
        });
      }

      // Create boundaries
      if (data.boundaries?.length > 0) {
        await tx.personBoundary.createMany({
          data: data.boundaries.map((boundary) => ({
            personId: person.id,
            type: boundary.type as any,
            customName: boundary.customValue,
            availability: boundary.availability,
            privacy: boundary.privacy,
          })),
        });
      }

      return person;
    });

    return NextResponse.json({
      success: true,
      data: {
        personId: result.id,
        message: 'Onboarding completed successfully',
      },
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
