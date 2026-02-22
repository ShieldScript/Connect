import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/prayers/[id]
 * Get single prayer post with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, person) => {
    const { id } = await params;

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
        prayers: {
          where: {
            prayerId: person.id,
          },
          select: {
            id: true,
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

    // Transform to include userPrayed flag
    const prayerWithStatus = {
      id: prayer.id,
      content: prayer.content,
      prayerCount: prayer.prayerCount,
      createdAt: prayer.createdAt,
      updatedAt: prayer.updatedAt,
      author: prayer.author,
      userPrayed: prayer.prayers.length > 0,
    };

    return NextResponse.json({ prayer: prayerWithStatus });
  }, { requireOnboarding: true });
}

/**
 * PATCH /api/prayers/[id]
 * Update a prayer post (author only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, person) => {
    const { id } = await params;
    const body = await req.json();
    const { content } = body;

    // Validation
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: 'Content cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { error: 'Content must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Verify prayer exists and user is the author
    const prayer = await prisma.prayerPost.findUnique({
      where: { id },
      select: {
        authorId: true,
        deletedAt: true,
      },
    });

    if (!prayer) {
      return NextResponse.json(
        { error: 'Prayer not found' },
        { status: 404 }
      );
    }

    if (prayer.deletedAt) {
      return NextResponse.json(
        { error: 'Prayer has been deleted' },
        { status: 410 }
      );
    }

    if (prayer.authorId !== person.id) {
      return NextResponse.json(
        { error: 'You can only edit your own prayers' },
        { status: 403 }
      );
    }

    // Update prayer
    const updatedPrayer = await prisma.prayerPost.update({
      where: { id },
      data: {
        content: trimmedContent,
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

    return NextResponse.json({
      prayer: {
        id: updatedPrayer.id,
        content: updatedPrayer.content,
        prayerCount: updatedPrayer.prayerCount,
        createdAt: updatedPrayer.createdAt,
        updatedAt: updatedPrayer.updatedAt,
        author: updatedPrayer.author,
      },
    });
  }, { requireOnboarding: true });
}

/**
 * DELETE /api/prayers/[id]
 * Soft delete a prayer post (author only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, person) => {
    const { id } = await params;

    // Verify prayer exists and user is the author
    const prayer = await prisma.prayerPost.findUnique({
      where: { id },
      select: {
        authorId: true,
        deletedAt: true,
      },
    });

    if (!prayer) {
      return NextResponse.json(
        { error: 'Prayer not found' },
        { status: 404 }
      );
    }

    if (prayer.deletedAt) {
      return NextResponse.json(
        { error: 'Prayer already deleted' },
        { status: 410 }
      );
    }

    if (prayer.authorId !== person.id) {
      return NextResponse.json(
        { error: 'You can only delete your own prayers' },
        { status: 403 }
      );
    }

    // Soft delete
    await prisma.prayerPost.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  }, { requireOnboarding: true });
}
