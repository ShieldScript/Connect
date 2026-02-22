import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/middleware/auth';
import { getPersonBySupabaseId } from '@/lib/services/personService';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

/**
 * POST /api/persons/me/update-profile
 * Update interests, archetype, and connection style (used by The Forge skill update page)
 */

const interestWithProficiencySchema = z.object({
  interestId: z.string().uuid(),
  proficiencyLevel: z.number().int().min(1).max(5), // 1-5: Novice to Expert/Pro
});

const updateProfileSchema = z.object({
  // Optional: interests with proficiency levels (unlimited)
  interests: z.array(interestWithProficiencySchema).optional(),

  // Optional: archetype and connection style
  archetype: z.string().optional(),
  connectionStyle: z.string().optional(),

  // Optional: location details (allow empty strings or undefined)
  community: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),

  // Optional: search preferences
  proximityRadiusKm: z.number().int().min(1).max(999).optional(),

  // Optional: bio (connection protocol, allow empty strings)
  bio: z.string().max(500).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const person = await getPersonBySupabaseId(user.id);

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    console.log('🔍 Received update-profile payload:', JSON.stringify(body, null, 2));

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);

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
      interests,
      archetype,
      connectionStyle,
      community,
      city,
      region,
      proximityRadiusKm,
      bio,
    } = validationResult.data;

    // Build update data object (only include fields that were provided)
    const updateData: Prisma.PersonUpdateInput = {};

    if (archetype !== undefined && archetype !== null) {
      updateData.archetype = archetype;
    }
    if (connectionStyle !== undefined && connectionStyle !== null) {
      updateData.connectionStyle = connectionStyle;
    }
    if (community !== undefined) {
      updateData.community = community || null; // Convert empty string to null
    }
    if (city !== undefined) {
      updateData.city = city || null; // Convert empty string to null
    }
    if (region !== undefined) {
      updateData.region = region || null; // Convert empty string to null
    }
    if (proximityRadiusKm !== undefined && proximityRadiusKm !== null) {
      updateData.proximityRadiusKm = proximityRadiusKm;
    }
    if (bio !== undefined) {
      updateData.bio = bio || null; // Convert empty string to null
    }

    console.log('📝 Update data:', updateData);

    // Update person record if there are fields to update
    if (Object.keys(updateData).length > 0) {
      await prisma.person.update({
        where: { id: person.id },
        data: updateData,
      });
    }

    // Update interests if provided (replace existing)
    if (interests !== undefined) {
      await prisma.personInterest.deleteMany({
        where: { personId: person.id },
      });

      if (interests.length > 0) {
        await prisma.personInterest.createMany({
          data: interests.map((interest) => ({
            personId: person.id,
            interestId: interest.interestId,
            proficiencyLevel: interest.proficiencyLevel,
          })),
        });
      }
    }

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
      message: 'Profile updated successfully',
      person: {
        id: personWithInterests!.id,
        displayName: personWithInterests!.displayName,
        archetype: personWithInterests!.archetype,
        connectionStyle: personWithInterests!.connectionStyle,
        interests: personWithInterests!.interests.map((pi) => ({
          id: pi.interest.id,
          name: pi.interest.name,
          category: pi.interest.category,
          proficiencyLevel: pi.proficiencyLevel,
        })),
      },
    }, { status: 200 });

  } catch (error) {
    console.error('POST /api/persons/me/update-profile error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return detailed error for debugging
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
