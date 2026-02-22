import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function addAllenToHuddles() {
  console.log('🎯 Adding allen.chi to multiple huddles...\n');

  // Find allen.chi user
  const user = await prisma.person.findFirst({
    where: {
      email: {
        contains: 'allen',
        mode: 'insensitive',
      },
    },
    include: {
      memberships: {
        where: {
          status: 'ACTIVE',
          group: {
            category: 'HUDDLE',
          },
        },
      },
    },
  });

  if (!user) {
    console.error('❌ User allen.chi not found. Showing all users:');
    const allUsers = await prisma.person.findMany({
      select: { displayName: true, email: true },
      take: 10,
    });
    console.table(allUsers);
    return;
  }

  console.log(`👤 User: ${user.displayName} (${user.email})`);
  console.log(`📊 Current huddles: ${user.memberships.length}\n`);

  // Get existing huddle IDs the user is already in
  const existingHuddleIds = user.memberships.map(m => m.groupId);

  // Get all huddles
  const allHuddles = await prisma.group.findMany({
    where: {
      category: 'HUDDLE',
    },
  });

  console.log(`📋 Total huddles in database: ${allHuddles.length}\n`);

  // Get huddles the user is NOT in yet
  const availableHuddles = allHuddles.filter(
    h => !existingHuddleIds.includes(h.id) && h.currentSize < h.maxSize
  );

  if (availableHuddles.length === 0) {
    console.log('⚠️  Already in all available huddles or all are full.');
    return;
  }

  console.log(`📥 Joining ${Math.min(availableHuddles.length, 10)} huddles...\n`);

  // Join up to 10 huddles
  for (const huddle of availableHuddles.slice(0, 10)) {
    await prisma.groupMembership.create({
      data: {
        groupId: huddle.id,
        personId: user.id,
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
    });

    // Increment currentSize
    await prisma.group.update({
      where: { id: huddle.id },
      data: {
        currentSize: {
          increment: 1,
        },
      },
    });

    console.log(`✅ Joined: "${huddle.name}" (${huddle.currentSize + 1}/${huddle.maxSize})`);
  }

  const totalHuddles = user.memberships.length + Math.min(availableHuddles.length, 10);
  console.log(`\n🎉 Done! You now have ${totalHuddles} huddles!`);
  console.log('\n🔍 Refresh /huddles → My Huddles tab to see the dropdown!');
  console.log('💡 You should see 4 cards + a "+ X MORE" button\n');
}

addAllenToHuddles()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
