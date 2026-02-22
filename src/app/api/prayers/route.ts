import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/prayers
 * Fetch prayer wall feed (last 100 prayers)
 */
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, person) => {
    // Fetch prayers with author info and user's prayer status
    const prayers = await prisma.prayerPost.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
        prayers: {
          where: {
            prayerId: person.id,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Transform to include userPrayed flag
    const prayersWithStatus = prayers.map((prayer) => ({
      id: prayer.id,
      content: prayer.content,
      prayerCount: prayer.prayerCount,
      createdAt: prayer.createdAt,
      updatedAt: prayer.updatedAt,
      author: prayer.author,
      userPrayed: prayer.prayers.length > 0,
    }));

    return NextResponse.json({ prayers: prayersWithStatus });
  }, { requireOnboarding: true });
}

/**
 * POST /api/prayers
 * Create a new prayer post
 */
const createPrayerSchema = z.object({
  content: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, person) => {
    const body = await req.json();

    // Validate input
    const validationResult = createPrayerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { content } = validationResult.data;

    // Rate limiting: Check if user has posted more than 5 prayers in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentPrayers = await prisma.prayerPost.count({
      where: {
        authorId: person.id,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentPrayers >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before posting another prayer.' },
        { status: 429 }
      );
    }

    // Create prayer post
    const prayer = await prisma.prayerPost.create({
      data: {
        authorId: person.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({ prayer }, { status: 201 });
  }, { requireOnboarding: true });
}
