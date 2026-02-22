import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { HuddlesClient } from '@/components/HuddlesClient';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function HuddlesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const person = await prisma.person.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      interests: {
        include: {
          interest: true,
        },
      },
      memberships: {
        where: {
          status: 'ACTIVE',
          group: {
            category: 'HUDDLE',
          },
        },
        include: {
          group: {
            include: {
              creator: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
              memberships: {
                where: { status: 'ACTIVE' },
                include: {
                  person: {
                    select: {
                      id: true,
                      displayName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          joinedAt: 'desc',
        },
      },
    },
  });

  if (!person) {
    redirect('/onboarding');
  }

  // Map interests for mentor status
  const interests = person.interests.map(pi => ({
    ...pi.interest,
    proficiencyLevel: pi.proficiencyLevel,
  }));

  const mentorCount = interests.filter(pi => pi.proficiencyLevel >= 4).length;
  const isMentor = mentorCount > 0;
  const archetypeName = person.archetype;

  // Extract huddles from memberships
  const myHuddles = person.memberships.map(m => m.group);
  const myHuddleIds = myHuddles.map(h => h.id);

  // Fetch huddles to discover (not already joined)
  const allHuddles = await prisma.group.findMany({
    where: {
      category: 'HUDDLE',
      ...(myHuddleIds.length > 0 && {
        id: {
          notIn: myHuddleIds,
        },
      }),
    },
    include: {
      creator: {
        select: {
          id: true,
          displayName: true,
        },
      },
      memberships: {
        where: { status: 'ACTIVE' },
        include: {
          person: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  // Sort huddles: available first, full huddles at the end
  const availableHuddles = allHuddles.sort((a, b) => {
    const aIsFull = a.maxSize ? a.currentSize >= a.maxSize : false;
    const bIsFull = b.maxSize ? b.currentSize >= b.maxSize : false;

    // If one is full and the other isn't, non-full comes first
    if (aIsFull && !bIsFull) return 1;
    if (!aIsFull && bIsFull) return -1;

    // Otherwise maintain creation order (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <DashboardClient
      personId={person.id}
      displayName={person.displayName}
      email={person.email}
      onboardingLevel={person.onboardingLevel}
      isMentor={isMentor}
      archetypeName={archetypeName || ''}
      primaryCraftName={interests[0]?.name}
    >
      <HuddlesClient
        personId={person.id}
        personName={person.displayName}
        myHuddles={myHuddles}
        availableHuddles={availableHuddles}
      />
    </DashboardClient>
  );
}
