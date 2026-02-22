import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function makeHuddleFull() {
  console.log('Making "Young Fathers Circle" huddle full...\n');

  // Find the huddle by name
  const huddle = await prisma.group.findFirst({
    where: {
      name: 'Young Fathers Circle',
      category: 'HUDDLE',
    },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  if (!huddle) {
    console.error('❌ Huddle "Young Fathers Circle" not found.');
    return;
  }

  const currentMembers = huddle.memberships.length;
  const spotsNeeded = huddle.maxSize - currentMembers;

  console.log(`📊 Current: ${currentMembers}/${huddle.maxSize} members`);
  console.log(`➕ Need to add: ${spotsNeeded} more members\n`);

  if (spotsNeeded <= 0) {
    console.log('✅ Huddle is already full!');
    return;
  }

  // Get users that are not already in this huddle
  const existingMemberIds = huddle.memberships.map(m => m.personId);
  const availableUsers = await prisma.person.findMany({
    where: {
      id: {
        notIn: existingMemberIds,
      },
    },
    take: spotsNeeded,
  });

  if (availableUsers.length < spotsNeeded) {
    console.log(`⚠️  Only ${availableUsers.length} users available, but need ${spotsNeeded}.`);
  }

  // Add members until full
  for (let i = 0; i < Math.min(spotsNeeded, availableUsers.length); i++) {
    await prisma.groupMembership.create({
      data: {
        groupId: huddle.id,
        personId: availableUsers[i].id,
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
    });

    console.log(`✅ Added ${availableUsers[i].displayName} to huddle`);
  }

  // Update currentSize
  await prisma.group.update({
    where: { id: huddle.id },
    data: {
      currentSize: currentMembers + availableUsers.length,
    },
  });

  console.log(`\n🎉 Huddle "${huddle.name}" is now ${currentMembers + availableUsers.length}/${huddle.maxSize} members!`);
  console.log('\nNavigate to /huddles → Discover tab to see it marked as FULL');
}

makeHuddleFull()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
