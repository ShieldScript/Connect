'use server'

import { prisma } from '@/lib/prisma'
import { cache, CACHE_TTL } from '@/lib/cache'
import { Prisma } from '@prisma/client'

/**
 * Server Action: Fetch all dashboard data in one optimized call
 * Handles person data, interests, memberships, huddles, prayers, and nearby count
 */
export async function getDashboardData(supabaseUserId: string) {
  try {
    // Step 1: Parallel fetch of base data
    const [basePerson, personInterests, personMemberships] = await Promise.all([
      prisma.person.findUnique({
        where: { supabaseUserId },
      }),

      prisma.personInterest.findMany({
        where: { person: { supabaseUserId } },
      }),

      prisma.groupMembership.findMany({
        where: {
          person: { supabaseUserId },
          status: 'ACTIVE',
        },
        orderBy: { joinedAt: 'desc' },
      }),
    ])

    if (!basePerson) {
      return { error: 'Person not found', person: null }
    }

    // Step 2: Fetch related data in parallel
    const interestIds = personInterests.map(pi => pi.interestId)
    const membershipGroupIds = personMemberships.map(m => m.groupId)

    const [interestRecords, groups] = await Promise.all([
      interestIds.length > 0
        ? prisma.interest.findMany({ where: { id: { in: interestIds } } })
        : Promise.resolve([]),

      membershipGroupIds.length > 0
        ? prisma.group.findMany({
            where: {
              id: { in: membershipGroupIds },
              category: 'HUDDLE',
            },
          })
        : Promise.resolve([]),
    ])

    // Step 3: Get group memberships for huddles
    const huddleGroupIds = groups.map(g => g.id)
    const groupMemberships = huddleGroupIds.length > 0
      ? await prisma.groupMembership.findMany({
          where: {
            groupId: { in: huddleGroupIds },
            status: 'ACTIVE',
          },
        })
      : []

    // Step 4: Reconstruct person object with nested relations
    const interestLookup: Record<string, any> = {}
    interestRecords.forEach(i => { interestLookup[i.id] = i })

    const groupLookup: Record<string, any> = {}
    groups.forEach(g => { groupLookup[g.id] = g })

    const membershipsByGroupId: Record<string, any[]> = {}
    groupMemberships.forEach(m => {
      if (!membershipsByGroupId[m.groupId]) {
        membershipsByGroupId[m.groupId] = []
      }
      if (membershipsByGroupId[m.groupId].length < 4) {
        membershipsByGroupId[m.groupId].push(m)
      }
    })

    const person = {
      ...basePerson,
      interests: personInterests.map(pi => ({
        ...pi,
        interest: interestLookup[pi.interestId] || null,
      })),
      memberships: personMemberships
        .filter(m => groupLookup[m.groupId])
        .map(m => ({
          ...m,
          group: {
            ...groupLookup[m.groupId],
            memberships: membershipsByGroupId[m.groupId] || [],
          },
        })),
    }

    // Step 5: Fetch nearby count, huddles, and prayers in parallel
    const savedRadius = person.proximityRadiusKm || 5

    const [nearbyCount, myHuddles, recentPrayers] = await Promise.all([
      getNearbyCount(person),
      getHuddlesWithUnreadCounts(person),
      getRecentPrayers(person),
    ])

    return {
      person,
      nearbyCount,
      myHuddles,
      recentPrayers,
      savedRadius,
      error: null,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)

    // Provide specific error messages for common issues
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: 'Database constraint violation. Please try again.', person: null }
      }
      if (error.code === 'P2025') {
        return { error: 'Record not found. Please try refreshing the page.', person: null }
      }
    }

    return {
      error: 'Unable to load dashboard. Please try refreshing the page.',
      person: null
    }
  }
}

/**
 * Helper: Get nearby count with caching and PostgreSQL function
 */
async function getNearbyCount(person: any): Promise<number> {
  if (!person.latitude || !person.longitude) return 0

  const savedRadius = person.proximityRadiusKm || 5
  const cacheKey = `nearby:${person.id}:${savedRadius}`
  const cached = cache.get<number>(cacheKey, CACHE_TTL.NEARBY_COUNT)

  if (cached !== null) {
    return cached
  }

  try {
    const result = await Promise.race([
      prisma.$queryRaw<Array<{ get_nearby_count: number }>>`
        SELECT get_nearby_count(
          ${person.latitude}::double precision,
          ${person.longitude}::double precision,
          ${savedRadius}::double precision,
          ${person.id}::text
        ) as get_nearby_count
      `,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )
    ]) as Array<{ get_nearby_count: number }>

    const count = Number(result[0]?.get_nearby_count || 0)
    cache.set(cacheKey, count)
    return count
  } catch (error) {
    console.error('Error fetching nearby count:', error)
    return 0
  }
}

/**
 * Helper: Get huddles with unread counts using PostgreSQL function
 */
async function getHuddlesWithUnreadCounts(person: any): Promise<any[]> {
  if (person.memberships.length === 0) return []

  try {
    const unreadCountPromises = person.memberships.map(async (membership: any) => {
      const cacheKey = `unread:${membership.groupId}:${person.id}`
      const cached = cache.get<number>(cacheKey, CACHE_TTL.UNREAD_COUNT)

      if (cached !== null) {
        return { huddleId: membership.groupId, count: cached }
      }

      try {
        const result = await prisma.$queryRaw<Array<{ get_unread_huddle_count: number }>>`
          SELECT get_unread_huddle_count(
            ${membership.groupId}::text,
            ${person.id}::text
          ) as get_unread_huddle_count
        `

        const count = Number(result[0]?.get_unread_huddle_count || 0)
        cache.set(cacheKey, count)

        return { huddleId: membership.groupId, count }
      } catch (err) {
        console.error(`Error fetching unread count for huddle ${membership.groupId}:`, err)
        return { huddleId: membership.groupId, count: 0 }
      }
    })

    const unreadCounts = await Promise.all(unreadCountPromises)

    const countMap: Record<string, number> = {}
    unreadCounts.forEach(c => { countMap[c.huddleId] = c.count })

    const huddles = person.memberships.map((membership: any) => ({
      ...membership.group,
      unreadCount: countMap[membership.groupId] || 0,
      membershipId: membership.id,
    }))

    // Sort: unread first, then by most recent activity
    huddles.sort((a: any, b: any) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return huddles
  } catch (error) {
    console.error('Error fetching huddle unread counts:', error)
    return person.memberships.map((membership: any) => ({
      ...membership.group,
      unreadCount: 0,
      membershipId: membership.id,
    }))
  }
}

/**
 * Helper: Get recent prayers for Prayer Wall preview
 */
async function getRecentPrayers(person: any): Promise<any[]> {
  try {
    const prayers = await prisma.prayerPost.findMany({
      where: { deletedAt: null },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
          },
        },
        prayers: {
          where: { prayerId: person.id },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })

    return prayers.map((prayer) => ({
      id: prayer.id,
      content: prayer.content,
      prayerCount: prayer.prayerCount,
      createdAt: prayer.createdAt,
      updatedAt: prayer.updatedAt,
      author: prayer.author,
      userPrayed: prayer.prayers.length > 0,
    }))
  } catch (error) {
    console.error('Error fetching recent prayers:', error)
    return []
  }
}
