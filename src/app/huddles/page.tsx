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

  // Optimize: Fetch data in parallel with shallow includes
  const [person, personInterests, huddleMemberships] = await Promise.all([
    // Query 1: Person data only
    prisma.person.findUnique({
      where: { supabaseUserId: user.id },
    }),

    // Query 2: Person interests
    prisma.personInterest.findMany({
      where: {
        person: { supabaseUserId: user.id },
      },
      include: {
        interest: true,
      },
    }),

    // Query 3: Person's huddle memberships
    prisma.groupMembership.findMany({
      where: {
        person: { supabaseUserId: user.id },
        status: 'ACTIVE',
        group: {
          category: 'HUDDLE',
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    }),
  ]);

  if (!person) {
    redirect('/onboarding');
  }

  // Map interests for mentor status
  const interests = personInterests.filter(pi => pi.interest != null).map(pi => ({
    ...pi.interest!,
    proficiencyLevel: pi.proficiencyLevel,
  }));

  const mentorCount = interests.filter(pi => pi.proficiencyLevel >= 4).length;
  const isMentor = mentorCount > 0;
  const archetypeName = person.archetype;

  // Get my huddle IDs and fetch groups + available huddles in parallel
  const myHuddleIds = huddleMemberships.map(m => m.groupId);

  const [myHuddleGroups, availableHuddleGroups] = await Promise.all([
    // Query 4: My huddle groups
    myHuddleIds.length > 0
      ? prisma.group.findMany({
          where: { id: { in: myHuddleIds } },
        })
      : Promise.resolve([]),

    // Query 5: Available huddles to discover
    prisma.group.findMany({
      where: {
        category: 'HUDDLE',
        ...(myHuddleIds.length > 0 && {
          id: {
            notIn: myHuddleIds,
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    }),
  ]);

  // Fetch creators and memberships for all huddles in parallel
  const allHuddleIds = [...myHuddleIds, ...availableHuddleGroups.map(g => g.id)];
  const allHuddleCreatorIds = [...new Set([
    ...myHuddleGroups.map(g => g.createdBy),
    ...availableHuddleGroups.map(g => g.createdBy),
  ])].filter(Boolean) as string[];

  const [allCreators, allHuddleMemberships] = await Promise.all([
    // Query 6: All creators
    allHuddleCreatorIds.length > 0
      ? prisma.person.findMany({
          where: { id: { in: allHuddleCreatorIds } },
          select: {
            id: true,
            displayName: true,
          },
        })
      : Promise.resolve([]),

    // Query 7: All huddle memberships
    allHuddleIds.length > 0
      ? prisma.groupMembership.findMany({
          where: {
            groupId: { in: allHuddleIds },
            status: 'ACTIVE',
          },
        })
      : Promise.resolve([]),
  ]);

  // Fetch all member persons
  const allMemberPersonIds = [...new Set(allHuddleMemberships.map(m => m.personId))];
  const allMemberPersons = allMemberPersonIds.length > 0
    ? await prisma.person.findMany({
        where: { id: { in: allMemberPersonIds } },
        select: {
          id: true,
          displayName: true,
        },
      })
    : [];

  // Create lookup maps
  const creatorMap = new Map(allCreators.map(c => [c.id, c]));
  const personMap = new Map(allMemberPersons.map(p => [p.id, p]));
  const membershipsByGroup = new Map<string, typeof allHuddleMemberships>();

  for (const membership of allHuddleMemberships) {
    const existing = membershipsByGroup.get(membership.groupId) || [];
    existing.push(membership);
    membershipsByGroup.set(membership.groupId, existing);
  }

  // Enrich my huddles with creator and membership data
  const myHuddles = myHuddleGroups.map(group => ({
    ...group,
    creator: creatorMap.get(group.createdBy) || { id: group.createdBy, displayName: 'Unknown' },
    memberships: (membershipsByGroup.get(group.id) || []).map(m => ({
      ...m,
      person: personMap.get(m.personId) || { id: m.personId, displayName: 'Unknown' },
    })),
  }));

  // Enrich available huddles
  const allHuddles = availableHuddleGroups.map(group => ({
    ...group,
    creator: creatorMap.get(group.createdBy) || { id: group.createdBy, displayName: 'Unknown' },
    memberships: (membershipsByGroup.get(group.id) || []).map(m => ({
      ...m,
      person: personMap.get(m.personId) || { id: m.personId, displayName: 'Unknown' },
    })),
  }));

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
