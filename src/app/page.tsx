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

    // STEP 1: Fetch person basic data only (no includes)
    const person = await prisma.person.findUnique({
      where: { supabaseUserId: user.id },
    })

    if (!person) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold">Finishing Setup...</h1>
          <p>Please wait while we set up your profile.</p>
        </div>
      )
    }

    // STEP 2: Fetch related data in parallel (shallow queries only)
    const [personInterests, interestRecords, huddleMemberships] = await Promise.all([
      // Fetch person's interest links
      prisma.personInterest.findMany({
        where: { personId: person.id },
      }),

      // Fetch all interests to join later
      prisma.interest.findMany(),

      // Fetch person's huddle memberships
      prisma.groupMembership.findMany({
        where: {
          personId: person.id,
          status: 'ACTIVE',
        },
        orderBy: {
          joinedAt: 'desc',
        },
      }),
    ])

    // STEP 3: Filter huddle memberships (need to check group category)
    const allGroupIds = huddleMemberships.map(m => m.groupId)
    const groups = allGroupIds.length > 0
      ? await prisma.group.findMany({
          where: {
            id: { in: allGroupIds },
            category: 'HUDDLE',
          },
        })
      : []

    const huddleGroupIds = groups.map(g => g.id)
    const filteredHuddleMemberships = huddleMemberships.filter(m =>
      huddleGroupIds.includes(m.groupId)
    )

    // STEP 4: Fetch group memberships for these huddles
    const groupMemberships = huddleGroupIds.length > 0
      ? await prisma.groupMembership.findMany({
          where: {
            groupId: { in: huddleGroupIds },
            status: 'ACTIVE',
          },
        })
      : []

    // STEP 5: Join data using simple array operations (NO Map constructors)
    // Create interest lookup using plain object
    const interestLookup: Record<string, any> = {}
    for (const interest of interestRecords) {
      interestLookup[interest.id] = interest
    }

    // Enrich person interests
    const enrichedInterests = personInterests
      .map(pi => {
        const interest = interestLookup[pi.interestId]
        if (!interest) return null
        return {
          ...interest,
          proficiencyLevel: pi.proficiencyLevel,
        }
      })
      .filter(i => i !== null)

    // Create group lookup using plain object
    const groupLookup: Record<string, any> = {}
    for (const group of groups) {
      groupLookup[group.id] = group
    }

    // Group memberships by groupId using plain object
    const membershipsByGroupId: Record<string, any[]> = {}
    for (const membership of groupMemberships) {
      if (!membershipsByGroupId[membership.groupId]) {
        membershipsByGroupId[membership.groupId] = []
      }
      if (membershipsByGroupId[membership.groupId].length < 4) {
        membershipsByGroupId[membership.groupId].push(membership)
      }
    }

    // Create enriched memberships
    const enrichedMemberships = filteredHuddleMemberships
      .map(m => {
        const group = groupLookup[m.groupId]
        if (!group) return null
        return {
          ...m,
          group: {
            ...group,
            memberships: membershipsByGroupId[m.groupId] || [],
          },
        }
      })
      .filter(m => m !== null)

    // STEP 6: Use enriched data for calculations
    const interests = enrichedInterests

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
    const station = person.community || 'Your Community'
    const city = person.city || 'Your City'
    const region = person.region || 'Your Region'
    const archetypeName = person.archetype

    // STEP 7: Parallelize nearby count and huddle queries
    const savedRadius = person.proximityRadiusKm || 5

    const [nearbyCount, myHuddles] = await Promise.all([
      // Query: Nearby count with timeout
      (async () => {
        if (!person.latitude || !person.longitude) return 0
        try {
          const nearbyPersons = await Promise.race([
            prisma.$queryRaw<any[]>`
              SELECT COUNT(*) as count
              FROM "Person" p
              WHERE
                p."onboardingLevel" >= 1
                AND ST_DWithin(
                  p.location::geography,
                  ST_SetSRID(ST_MakePoint(${person.longitude}, ${person.latitude}), 4326)::geography,
                  ${savedRadius * 1000}
                )
                AND p.location IS NOT NULL
                AND p.id != ${person.id}
            `,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), 5000)
            )
          ]) as any[]
          return Number(nearbyPersons[0]?.count || 0)
        } catch (error) {
          console.error('Error fetching nearby count:', error)
          return 0
        }
      })(),

      // Query: Huddles with unread counts (NO Prisma.join!)
      (async () => {
        if (enrichedMemberships.length === 0) return []

        const huddleIds = enrichedMemberships.map(m => m.groupId)

        try {
          // Use UNION ALL to get all counts in one query - production safe!
          const unreadCounts = await Promise.race([
            (async () => {
              if (huddleIds.length === 0) return []

              // Build UNION ALL query for all huddles
              const queries = huddleIds.map(huddleId => {
                return `
                  SELECT
                    '${huddleId}'::text as "huddleId",
                    COUNT(*)::int as count
                  FROM "HuddleMessage" hm
                  INNER JOIN "GroupMembership" gm ON gm."groupId" = hm."huddleId"
                  WHERE
                    hm."huddleId" = '${huddleId}'
                    AND hm."senderId" != '${person.id}'
                    AND hm."deletedAt" IS NULL
                    AND gm."personId" = '${person.id}'
                    AND hm."createdAt" > COALESCE(gm."lastReadAt", gm."joinedAt", '1970-01-01'::timestamp)
                `
              })

              const unionQuery = queries.join(' UNION ALL ')
              const result = await prisma.$queryRawUnsafe<Array<{ huddleId: string; count: number }>>(unionQuery)

              return result
            })(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Huddles query timeout')), 10000)
            )
          ]) as Array<{ huddleId: string; count: number }>

          // Use plain object for lookup
          const countLookup: Record<string, number> = {}
          for (const item of unreadCounts) {
            countLookup[item.huddleId] = item.count
          }

          return enrichedMemberships.map((membership, idx) => {
            // TEMPORARY: Simulate unread badges for testing
            const actualUnread = countLookup[membership.groupId] || 0
            const simulatedUnreadCount = idx === 0 ? 3 : idx === 1 ? 12 : actualUnread

            return {
              ...membership.group,
              unreadCount: simulatedUnreadCount,
              membershipId: membership.id,
            }
          })
        } catch (error) {
          console.error('Error fetching huddle unread counts:', error)
          return enrichedMemberships.map(membership => ({
            ...membership.group,
            unreadCount: 0,
            membershipId: membership.id,
          }))
        }
      })()
    ])

    // Format connection style
    const connectionStyleMap: Record<string, string> = {
      'workshop': 'Builders',
      'fireside': 'The Fireside',
      'outpost': 'Bridge',
    }
    const connectionStyle = person.connectionStyle
      ? (connectionStyleMap[person.connectionStyle] || 'Builders')
      : 'Builders'

    // Sort: unread first, then by most recent activity
    myHuddles.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return (
      <DashboardClient
        personId={person.id}
        displayName={person.displayName}
        email={person.email}
        onboardingLevel={person.onboardingLevel}
        isMentor={isMentor}
        archetypeName={archetypeName || ''}
        primaryCraftName={primaryCraft?.name}
        station={station}
        city={city}
        region={region}
        connectionStyle={connectionStyle}
        latitude={person.latitude || undefined}
        longitude={person.longitude || undefined}
      >
        <div className="max-w-7xl mx-auto p-8">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome, {person.displayName}
                </h1>
                <p className="text-lg text-gray-600">
                  {formatArchetype(archetypeName)} • {connectionStyle}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Huddles Card */}
            <Link
              href="/huddles"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <Shield className="w-8 h-8 text-green-600" strokeWidth={1.5} />
                {myHuddles.filter(h => h.unreadCount > 0).length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {myHuddles.reduce((sum, h) => sum + h.unreadCount, 0)}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{myHuddles.length}</h3>
              <p className="text-sm text-gray-600">Active Huddles</p>
            </Link>

            {/* Brothers Nearby Card */}
            <Link
              href="/groups"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{nearbyCount}</h3>
              <p className="text-sm text-gray-600">Brothers Nearby</p>
            </Link>

            {/* Station Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <MapPin className="w-8 h-8 text-purple-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{city}</h3>
              <p className="text-sm text-gray-600">{region}</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Fellows */}
            <div className="lg:col-span-2">
              <FellowsSection
                currentUserId={person.id}
                currentUserLocation={{
                  lat: person.latitude || 51.045,
                  lng: person.longitude || -114.065,
                }}
                savedRadius={savedRadius}
              />
            </div>

            {/* Right Column - Prayer Wall */}
            <div className="lg:col-span-1">
              <PrayerWallPreview currentUserId={person.id} />
            </div>
          </div>
        </div>
      </DashboardClient>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600">Error Loading Dashboard</h1>
        <p className="text-gray-600 mb-4">An error occurred while loading your dashboard.</p>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-w-2xl">
          {error instanceof Error ? error.message : String(error)}
        </pre>
        <Link href="/login" className="mt-4 text-blue-600 hover:underline">
          Return to Login
        </Link>
      </div>
    )
  }
}
