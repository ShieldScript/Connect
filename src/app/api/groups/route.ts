import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * POST /api/groups
 * Create a new gathering
 */

const createGroupSchema = z.object({
  name: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(300).optional(),
  protocol: z.string().max(500).optional(),
  type: z.enum(['HOBBY', 'SUPPORT', 'SPIRITUAL', 'PROFESSIONAL', 'SOCIAL', 'OTHER']),
  category: z.enum(['CIRCLE', 'HUDDLE']).default('CIRCLE'),
  isVirtual: z.boolean().default(false),
  locationName: z.string().max(200).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  minSize: z.number().int().min(2).max(100).optional(),
  maxSize: z.number().int().min(2).max(100).optional(),
  tags: z.array(z.string()).default([]),
}).refine((data) => {
  // Huddle-specific validation
  if (data.category === 'HUDDLE') {
    if (data.maxSize && (data.maxSize < 3 || data.maxSize > 6)) {
      return false;
    }
    if (data.minSize && (data.minSize < 3 || data.minSize > 6)) {
      return false;
    }
  }
  return true;
}, {
  message: 'Huddles must have 3-6 members',
  path: ['maxSize'],
});

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, person) => {
    const body = await req.json();

    console.log('🔍 Received create group payload:', JSON.stringify(body, null, 2));

    // Validate input
    const validationResult = createGroupSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ Validation failed:', JSON.stringify(validationResult.error.issues, null, 2));
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
      name,
      description,
      protocol,
      type,
      category,
      isVirtual,
      locationName,
      latitude,
      longitude,
      minSize,
      maxSize,
      tags,
    } = validationResult.data;

    // Auto-set type to SPIRITUAL for huddles
    const finalType = category === 'HUDDLE' ? 'SPIRITUAL' : type;

    // FIX: Wrap all group creation steps in a transaction to prevent partial updates
    const group = await prisma.$transaction(async (tx) => {
      // 1. Create the group
      const newGroup = await tx.group.create({
        data: {
          name,
          description,
          protocol,
          type: finalType,
          category,
          isVirtual,
          locationName,
          latitude,
          longitude,
          minSize,
          maxSize,
          currentSize: 1, // Creator is first member
          tags,
          status: 'ACTIVE',
          createdBy: person.id,
          leaderIds: [person.id],
        },
      });

      // 2. Update PostGIS location column for physical gatherings
      if (!isVirtual && latitude !== null && longitude !== null) {
        await tx.$executeRaw`
          UPDATE "Group"
          SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
          WHERE id = ${newGroup.id}
        `;
      }

      // 3. Add creator as first member
      await tx.groupMembership.create({
        data: {
          personId: person.id,
          groupId: newGroup.id,
          role: 'CREATOR',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });

      return newGroup;
    });

    console.log('✅ Group created:', group.id);

    return NextResponse.json({
      message: 'Gathering created successfully',
      group: {
        id: group.id,
        name: group.name,
        type: group.type,
        isVirtual: group.isVirtual,
      },
    }, { status: 201 });
  }, { requireOnboarding: true });
}
