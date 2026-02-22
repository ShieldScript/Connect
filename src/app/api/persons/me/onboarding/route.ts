import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * POST /api/persons/me/onboarding
 * Complete Level 1 onboarding with leadership signals
 */

const interestWithProficiencySchema = z.object({
  interestId: z.string().uuid(),
  proficiencyLevel: z.number().int().min(1).max(5), // 1-5: Novice to Expert/Pro
});

const leadershipSignalsSchema = z.object({
  willingness: z.enum(['participate', 'help_organize', 'share_skills']),
  hasAssets: z.boolean(),
  notifyForNewGroups: z.boolean(),
});

const covenantDataSchema = z.object({
  churchAffiliation: z.string().max(100).optional(),
  spiritualGoals: z.array(z.string()).min(1, 'Select at least 1 spiritual goal').max(5),
  accountabilityAreas: z.array(z.string()).min(1, 'Select at least 1 accountability area').max(10),
  covenantAgreedAt: z.string().datetime(),
});

const onboardingSchema = z.object({
  // Required: display name
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),

  // Optional: bio
  bio: z.string().max(200).optional(),

  // Required: interests with proficiency levels
  interests: z.array(interestWithProficiencySchema).min(3, 'Select at least 3 interests').max(20),

  // Required: location (lat/lng)
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  // Required: location details
  community: z.string().min(1, 'Community is required').max(100),
  city: z.string().min(1, 'City is required').max(100),
  region: z.string().min(1, 'Region is required').max(100),

  // Optional: archetype and connection style
  archetype: z.string().optional(),
  connectionStyle: z.string().optional(),

  // Required: leadership signals
  leadershipSignals: leadershipSignalsSchema,

  // Required: covenant data
  covenantData: covenantDataSchema,
});

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, person) => {
    // Check if already onboarded
    if (person.onboardingLevel >= 1) {
      return NextResponse.json(
        { error: 'Already onboarded', onboardingLevel: person.onboardingLevel },
        { status: 400 }
      );
    }

    const body = await req.json();

    console.log('🔍 Received onboarding payload:', JSON.stringify(body, null, 2));

    // Validate input
    const validationResult = onboardingSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ Validation failed:', JSON.stringify(validationResult.error.issues, null, 2));
      console.error('📦 Failed payload:', JSON.stringify(body, null, 2));
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      displayName,
      bio,
      interests,
      latitude,
      longitude,
      community,
      city,
      region,
      archetype,
      connectionStyle,
      leadershipSignals,
      covenantData,
    } = validationResult.data;

    // FIX: Wrap onboarding updates in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Update person record with onboarding data
      await tx.person.update({
        where: { id: person.id },
        data: {
          displayName,
          bio: bio || null,
          latitude,
          longitude,
          community,
          city,
          region,
          archetype,
          connectionStyle,
          leadershipSignals,
          churchAffiliation: covenantData.churchAffiliation || null,
          spiritualGoals: covenantData.spiritualGoals,
          accountabilityAreas: covenantData.accountabilityAreas,
          covenantAgreedAt: new Date(covenantData.covenantAgreedAt),
          covenantData: covenantData,
          onboardingLevel: 1,
        },
      });

      // 2. Replace interests atomically
      await tx.personInterest.deleteMany({
        where: { personId: person.id },
      });

      await tx.personInterest.createMany({
        data: interests.map((interest) => ({
          personId: person.id,
          interestId: interest.interestId,
          proficiencyLevel: interest.proficiencyLevel,
        })),
      });

      // 3. Update PostGIS location field for spatial queries
      if (latitude && longitude) {
        await tx.$executeRaw`
          UPDATE "Person"
          SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
          WHERE id = ${person.id}
        `;
      }
    });

    // Fetch updated person with interests
    const personWithInterests = await prisma.person.findUnique({
      where: { id: person.id },
      include: {
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      person: {
        id: personWithInterests!.id,
        displayName: personWithInterests!.displayName,
        onboardingLevel: personWithInterests!.onboardingLevel,
        interests: personWithInterests!.interests.map((pi) => ({
          id: pi.interest.id,
          name: pi.interest.name,
          category: pi.interest.category,
          proficiencyLevel: pi.proficiencyLevel,
        })),
        leadershipSignals: personWithInterests!.leadershipSignals,
      },
    }, { status: 201 });
  });
}
