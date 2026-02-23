import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight, Users2, Map, Hammer, Radio, MapPin, Bell, ArrowRight, Shield, Users } from 'lucide-react'
import { DashboardClient } from '@/components/DashboardClient'
import { FellowsSection } from '@/components/FellowsSection'
import { PrayerWallPreview } from '@/components/PrayerWallPreview'

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    // Optimize: Fetch in parallel with shallow includes instead of deeply nested
    const [person, personInterests, huddleMemberships] = await Promise.all([
      // Query 1: Person data only
      prisma.person.findUnique({
        where: { supabaseUserId: user.id },
      }),

      // Query 2: Person interests with interest details (2 level include - acceptable)
      prisma.personInterest.findMany({
        where: {
          person: { supabaseUserId: user.id },
        },
        include: {
          interest: true,
        },
      }),

      // Query 3: Active huddle memberships
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
    ])

  if (!person) {
    // This could happen if they signed up via Supabase but the Prisma record failed
    // Or if we're in a weird state.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">Finishing Setup...</h1>
        <p>Please wait while we set up your profile.</p>
      </div>
    )
  }

  // Fetch groups and their memberships in parallel
  const groupIds = huddleMemberships.map(m => m.groupId)
  const [groups, groupMemberships] = groupIds.length > 0
    ? await Promise.all([
        // Query 4: Fetch all groups
        prisma.group.findMany({
          where: { id: { in: groupIds } },
        }),
        // Query 5: Fetch all memberships for these groups
        prisma.groupMembership.findMany({
          where: {
            groupId: { in: groupIds },
            status: 'ACTIVE',
          },
          take: groupIds.length * 4, // Up to 4 members per group
        }),
      ])
    : [[], []]

  // Create lookup maps
  const groupMap = new Map(groups.map(g => [g.id, g]))
  const membershipsByGroup = new Map()
  for (const membership of groupMemberships) {
    const existing = membershipsByGroup.get(membership.groupId) || []
    if (existing.length < 4) {
      existing.push(membership)
      membershipsByGroup.set(membership.groupId, existing)
    }
  }

  // Enrich person data with fetched relations
  const enrichedPerson = {
    ...person,
    interests: personInterests,
    memberships: huddleMemberships.map(m => {
      const group = groupMap.get(m.groupId)
      if (!group) return null
      return {
        ...m,
        group: {
          ...group,
          memberships: membershipsByGroup.get(m.groupId) || [],
        },
      }
    }).filter((m): m is NonNullable<typeof m> => m !== null),
  }

  // Map interests for easier use (filter out any with missing interest data)
  const interests = enrichedPerson.interests
    .filter(pi => pi.interest != null)
    .map(pi => ({
      ...pi.interest!,
      proficiencyLevel: pi.proficiencyLevel,
    }))

  // Format archetype name (e.g., "sage" -> "The Sage")
  const formatArchetype = (name: string | null): string => {
    if (!name) return 'Active Member'
    const formatted = name.charAt(0).toUpperCase() + name.slice(1)
    return `The ${formatted}`
  }

  // Calculate stewardship stats
  const mentorCount = interests.filter(pi => pi.proficiencyLevel >= 4).length
  const learnerCount = interests.filter(pi => pi.proficiencyLevel <= 3).length
  const isMentor = mentorCount > 0

  // Get primary mentor craft
  const primaryMentorCraft = interests.find(pi => pi.proficiencyLevel >= 4)

  // Get primary learner craft
  const primaryLearnerCraft = interests.find(pi => pi.proficiencyLevel <= 3)

  const primaryCraft = isMentor ? primaryMentorCraft : primaryLearnerCraft

  // Extract data from Person model
  const station = enrichedPerson.community || 'Your Community'
  const city = enrichedPerson.city || 'Your City'
  const region = enrichedPerson.region || 'Your Region'
  const archetypeName = enrichedPerson.archetype

  // Parallelize nearby count and huddle queries
  const savedRadius = enrichedPerson.proximityRadiusKm || 5;

  const [nearbyCount, myHuddles] = await Promise.all([
    // Query 1: Nearby count with timeout
    (async () => {
      if (!enrichedPerson.latitude || !enrichedPerson.longitude) return 0;
      try {
        const nearbyPersons = await Promise.race([
          prisma.$queryRaw<any[]>`
            SELECT COUNT(*) as count
            FROM "Person" p
            WHERE
              p."onboardingLevel" >= 1
              AND ST_DWithin(
                p.location::geography,
                ST_SetSRID(ST_MakePoint(${enrichedPerson.longitude}, ${enrichedPerson.latitude}), 4326)::geography,
                ${savedRadius * 1000}
              )
              AND p.location IS NOT NULL
              AND p.id != ${enrichedPerson.id}
          `,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 5000)
          )
        ]) as any[];
        return Number(nearbyPersons[0]?.count || 0);
      } catch (error) {
        console.error('Error fetching nearby count:', error);
        return 0;
      }
    })(),

    // Query 2: Huddles with aggregated unread counts
    (async () => {
      if (enrichedPerson.memberships.length === 0) return [];

      const huddleIds = enrichedPerson.memberships.map(m => m.groupId);

      try {
        // Single aggregated query for all unread counts using IN clause
        // UUIDs are safe (from database), but escape as precaution
        const escapedIds = huddleIds
          .map(id => id.replace(/'/g, "''"))
          .map(id => `'${id}'`)
          .join(',');

        const unreadCounts = await Promise.race([
          prisma.$queryRawUnsafe<Array<{ huddleId: string; count: number }>>(
            `SELECT
              hm."huddleId",
              COUNT(*)::int as count
            FROM "HuddleMessage" hm
            INNER JOIN "GroupMembership" gm ON gm."groupId" = hm."huddleId"
            WHERE
              hm."huddleId" IN (${escapedIds})
              AND hm."senderId" != $1
              AND hm."deletedAt" IS NULL
              AND gm."personId" = $1
              AND hm."createdAt" > COALESCE(gm."lastReadAt", gm."joinedAt", '1970-01-01'::timestamp)
            GROUP BY hm."huddleId"`,
            enrichedPerson.id
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Huddles query timeout')), 10000)
          )
        ]) as Array<{ huddleId: string; count: number }>;

        const countMap = new Map(unreadCounts.map(c => [c.huddleId, c.count]));

        return enrichedPerson.memberships.map((membership, idx) => {
          // TEMPORARY: Simulate unread badges for testing
          const actualUnread = countMap.get(membership.groupId) || 0;
          const simulatedUnreadCount = idx === 0 ? 3 : idx === 1 ? 12 : actualUnread;

          return {
            ...membership.group,
            unreadCount: simulatedUnreadCount,
            membershipId: membership.id,
          };
        });
      } catch (error) {
        console.error('Error fetching huddle unread counts:', error);
        return enrichedPerson.memberships.map(membership => ({
          ...membership.group,
          unreadCount: 0,
          membershipId: membership.id,
        }));
      }
    })()
  ]);

  // Format connection style
  const connectionStyleMap: Record<string, string> = {
    'workshop': 'Builders',
    'fireside': 'The Fireside',
    'outpost': 'Bridge',
  }
  const connectionStyle = enrichedPerson.connectionStyle
    ? (connectionStyleMap[enrichedPerson.connectionStyle] || 'Builders')
    : 'Builders'

  // Sort: unread first, then by most recent activity
  myHuddles.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

    return (
      <DashboardClient
        personId={enrichedPerson.id}
        displayName={enrichedPerson.displayName}
        email={enrichedPerson.email}
        onboardingLevel={enrichedPerson.onboardingLevel}
        isMentor={isMentor}
        archetypeName={archetypeName || ''}
        primaryCraftName={primaryCraft?.name}
        station={station}
        city={city}
        region={region}
        connectionStyle={connectionStyle}
        latitude={enrichedPerson.latitude || undefined}
        longitude={enrichedPerson.longitude || undefined}
      >
      <main className="min-h-screen bg-white">
        {/* Preview State - Blurred Groups (Only when not onboarded) */}
        {enrichedPerson.onboardingLevel === 0 ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
            <div className="relative w-full max-w-6xl px-8">
              {/* Blurred Preview Content */}
              <div className="filter blur-md pointer-events-none select-none opacity-60">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Centered Overlay Card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-blue-100">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users2 className="w-8 h-8 text-blue-700" strokeWidth={2} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                    Your Local Fellowship Awaits
                  </h2>
                  <p className="text-gray-600 mb-6 text-center">
                    Finish your journey to unlock your local fellowship and connect with brothers nearby.
                  </p>
                  <form action="/onboarding">
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-800 hover:to-blue-700 transition-all"
                    >
                      Start Your Journey
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {/* Identity Header - Stewardship Brief */}
            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                {/* Left: Welcome & Archetype */}
                <div>
                  <h1 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Welcome Back,
                  </h1>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {enrichedPerson.displayName}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Archetype:</span>
                    <span className="text-sm font-bold text-blue-700 uppercase">
                      {formatArchetype(archetypeName)}
                    </span>
                  </div>
                </div>

                {/* Right: Quick Status (Condensed) */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">{interests.length} Skills</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">{savedRadius === 999 ? 'Global' : `${savedRadius}km`} Range</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500">{nearbyCount} Nearby</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Brothers Discovery - Mini-Card Layout */}
            <FellowsSection
              station={station}
              currentUserLat={enrichedPerson.latitude || 0}
              currentUserLng={enrichedPerson.longitude || 0}
              savedRadius={enrichedPerson.proximityRadiusKm || 5}
            />

            {/* My Huddles - Horizontal Scroll */}
            {myHuddles.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">My Huddles</h2>
                  <Link
                    href="/huddles"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View All Huddles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {myHuddles.map((huddle) => (
                    <Link
                      key={huddle.id}
                      href="/huddles"
                      className="relative bg-white border-2 border-green-200 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition flex-shrink-0 w-72"
                    >
                      {/* Unread Badge */}
                      {huddle.unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                          {huddle.unreadCount}
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <Shield className="w-8 h-8 text-green-600 flex-shrink-0" strokeWidth={2} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
                            {huddle.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Users className="w-3.5 h-3.5" />
                            <span>{huddle.currentSize}/{huddle.maxSize} members</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Prayer Wall Preview */}
            <PrayerWallPreview />

            {/* Active Opportunities - Banner Style with Micro-Copy */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-4">Active Opportunities</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Intel Banner */}
                <Link
                  href="/groups"
                  className="bg-white border border-gray-200 rounded-md p-4 hover:border-blue-600 transition group relative flex items-center gap-3"
                >
                  {/* New Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider rounded">
                      <Bell className="w-2.5 h-2.5" strokeWidth={2.5} />
                      New
                    </span>
                  </div>

                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">Discover</h3>
                    <p className="text-xs text-gray-500 leading-snug">12 brothers active near you. Your circle is growing.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition flex-shrink-0" strokeWidth={2} />
                </Link>

                {/* Signal Banner */}
                <Link
                  href="/profile"
                  className="bg-white border border-gray-200 rounded-md p-4 hover:border-blue-600 transition group flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Radio className="w-5 h-5 text-blue-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">Profile</h3>
                    <p className="text-xs text-gray-500 leading-snug">Set your connection preferences to help brothers find you.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition flex-shrink-0" strokeWidth={2} />
                </Link>

                {/* Profile Banner */}
                <Link
                  href="/profile"
                  className="bg-white border border-gray-200 rounded-md p-4 hover:border-blue-600 transition group flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hammer className="w-5 h-5 text-blue-700" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">Your Profile</h3>
                    <p className="text-xs text-gray-500 leading-snug">Your profile helps brothers find you. Share your story.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition flex-shrink-0" strokeWidth={2} />
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>
    </DashboardClient>
    )
  } catch (error) {
    console.error('Error loading dashboard:', error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
        <p className="text-gray-600 mb-2">An error occurred while loading your dashboard.</p>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-w-2xl">
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <Link href="/login" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Return to Login
        </Link>
      </div>
    )
  }
}
