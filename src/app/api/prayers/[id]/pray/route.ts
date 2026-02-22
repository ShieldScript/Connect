import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * POST /api/prayers/[id]/pray
 * Mark that user prayed for this prayer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, person) => {
    const { id } = await params;

    // Verify prayer exists and is not deleted
    const prayer = await prisma.prayerPost.findFirst({
      where: {
        id,
        deletedAt: null,
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

    if (!prayer) {
      return NextResponse.json(
        { error: 'Prayer not found' },
        { status: 404 }
      );
    }

    try {
      // Use a transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Create prayer response (unique constraint prevents duplicates)
        await tx.prayerResponse.create({
          data: {
            prayerPostId: id,
            prayerId: person.id,
          },
        });

        // Increment prayer count
        const updatedPrayer = await tx.prayerPost.update({
          where: { id },
          data: {
            prayerCount: {
              increment: 1,
            },
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

        // Create notification for prayer author (if not praying for own prayer)
        if (prayer.authorId !== person.id) {
          await tx.notification.create({
            data: {
              personId: prayer.authorId,
              type: 'PRAYER_RECEIVED',
              title: 'Prayer Support',
              message: 'A brother just prayed for you',
              relatedId: id,
            },
          });
        }

        return updatedPrayer;
      });

      return NextResponse.json({ prayer: result });
    } catch (error) {
      // Check if it's a unique constraint violation (already prayed)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return NextResponse.json(
            { error: 'You have already prayed for this prayer' },
            { status: 409 }
          );
        }
      }

      console.error('Error creating prayer response:', error);
      return NextResponse.json(
        { error: 'Failed to record prayer' },
        { status: 500 }
      );
    }
  }, { requireOnboarding: true });
}
