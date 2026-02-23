import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query'],
});

async function testDashboardPerformance() {
  console.log('\n🔍 Testing Dashboard Performance...\n');

  // Get a test user
  const testUser = await prisma.person.findFirst({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
  });

  if (!testUser) {
    console.log('❌ No test user found');
    return;
  }

  console.log(`✅ Testing with user: ${testUser.displayName} (${testUser.id})\n`);

  // Test 1: Person with nested includes
  console.log('📊 Test 1: Person query with nested includes');
  const start1 = Date.now();
  const person = await prisma.person.findUnique({
    where: { id: testUser.id },
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
              memberships: {
                where: { status: 'ACTIVE' },
                take: 4,
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
  const end1 = Date.now();
  console.log(`⏱️  Time: ${end1 - start1}ms`);
  console.log(`📝 Interests found: ${person?.interests?.length || 0}`);
  console.log(`📝 Memberships found: ${person?.memberships?.length || 0}\n`);

  // Test 2: Nearby count
  console.log('📊 Test 2: Nearby count query');
  const start2 = Date.now();
  const nearbyPersons = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count
    FROM "Person" p
    WHERE
      p."onboardingLevel" >= 1
      AND ST_DWithin(
        p.location::geography,
        ST_SetSRID(ST_MakePoint(${testUser.longitude}, ${testUser.latitude}), 4326)::geography,
        ${5 * 1000}
      )
      AND p.location IS NOT NULL
      AND p.id != ${testUser.id}
  `;
  const end2 = Date.now();
  console.log(`⏱️  Time: ${end2 - start2}ms`);
  console.log(`📝 Nearby count: ${nearbyPersons[0]?.count || 0}\n`);

  // Test 3: Unread messages count
  if (person?.memberships && person.memberships.length > 0) {
    console.log('📊 Test 3: Unread messages query');
    const start3 = Date.now();
    const huddleIds = person.memberships.map(m => m.groupId);
    const unreadCounts = await prisma.$queryRaw<Array<{ huddleId: string; count: number }>>`
      SELECT
        hm."huddleId",
        COUNT(*)::int as count
      FROM "HuddleMessage" hm
      INNER JOIN "GroupMembership" gm ON gm."groupId" = hm."huddleId"
      WHERE
        hm."huddleId" = ANY(ARRAY[${huddleIds.join(', ')}]::text[])
        AND hm."senderId" != ${testUser.id}
        AND hm."deletedAt" IS NULL
        AND gm."personId" = ${testUser.id}
        AND hm."createdAt" > COALESCE(gm."lastReadAt", gm."joinedAt", '1970-01-01'::timestamp)
      GROUP BY hm."huddleId"
    `;
    const end3 = Date.now();
    console.log(`⏱️  Time: ${end3 - start3}ms`);
    console.log(`📝 Unread counts: ${unreadCounts.length} huddles\n`);
  }

  console.log('✅ Performance test complete!\n');

  await prisma.$disconnect();
  await pool.end();
}

testDashboardPerformance().catch(console.error);
