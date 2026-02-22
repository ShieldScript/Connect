import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/interests
 * Get all interests, optionally filtered by category
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const interests = await prisma.interest.findMany({
      where: category ? { category } : undefined,
      orderBy: [
        { popularity: 'desc' },
        { name: 'asc' },
      ],
    });

    // Group by category for easier UI rendering
    const grouped = interests.reduce((acc, interest) => {
      if (!acc[interest.category]) {
        acc[interest.category] = [];
      }
      acc[interest.category].push(interest);
      return acc;
    }, {} as Record<string, typeof interests>);

    return NextResponse.json({
      interests,
      grouped,
      categories: Object.keys(grouped).sort(),
    });
  } catch (error) {
    console.error('GET /api/interests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
