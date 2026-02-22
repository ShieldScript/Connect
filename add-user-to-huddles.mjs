import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function addUserToHuddles() {
  console.log('🎯 Adding you to multiple huddles to test the dropdown...\n');

  // Get the first user (assuming that's you)
  const user = await prisma.person.findFirst({
    orderBy: { createdAt: 'asc' },
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
    console.error('❌ No users found.');
    return;
  }

  console.log(`👤 User: ${user.displayName}`);
  console.log(`📊 Current huddles: ${user.memberships.length}\n`);

  // Get existing huddle IDs the user is already in
  const existingHuddleIds = user.memberships.map(m => m.groupId);

  // Get all huddles the user is NOT in
  const availableHuddles = await prisma.group.findMany({
    where: {
      category: 'HUDDLE',
      id: {
        notIn: existingHuddleIds.length > 0 ? existingHuddleIds : undefined,
      },
      // Only join huddles with space
      currentSize: {
        lt: prisma.group.fields.maxSize,
      },
    },
    take: 10, // Join up to 10 more huddles
  });

  if (availableHuddles.length === 0) {
    console.log('⚠️  No available huddles to join.');

    // Create some new test huddles
    console.log('\n📝 Creating new test huddles...\n');

    const newHuddles = [
      {
        name: 'Morning Prayer Warriors',
        description: '5am daily prayer huddle for early risers committed to starting the day in Scripture and intercession.',
      },
      {
        name: 'Marriage Strengthening Circle',
        description: 'Husbands supporting each other in loving their wives well and leading their families with grace.',
      },
      {
        name: 'Financial Stewardship Group',
        description: 'Biblical principles for money, budgeting, giving, and breaking free from debt.',
      },
      {
        name: 'Addiction Recovery Brotherhood',
        description: 'Safe space for brothers fighting pornography, substance abuse, or other addictions.',
      },
      {
        name: 'Workplace Witness Huddle',
        description: 'Living out faith authentically in the workplace and being salt and light to coworkers.',
      },
    ];

    for (const huddleData of newHuddles) {
      const huddle = await prisma.group.create({
        data: {
          ...huddleData,
          type: 'SPIRITUAL',
          category: 'HUDDLE',
          isVirtual: true,
          minSize: 3,
          maxSize: 6,
          currentSize: 1,
          isPublic: true,
          status: 'ACTIVE',
          createdBy: user.id,
        },
      });

      // Add user as member
      await prisma.groupMembership.create({
        data: {
          groupId: huddle.id,
          personId: user.id,
          role: 'LEADER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });

      console.log(`✅ Created & joined: "${huddle.name}"`);
    }

    console.log(`\n🎉 Done! You now have ${user.memberships.length + newHuddles.length} huddles!`);
  } else {
    // Join existing huddles
    console.log(`📥 Joining ${availableHuddles.length} existing huddles...\n`);

    for (const huddle of availableHuddles) {
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

      console.log(`✅ Joined: "${huddle.name}"`);
    }

    const totalHuddles = user.memberships.length + availableHuddles.length;
    console.log(`\n🎉 Done! You now have ${totalHuddles} huddles!`);
  }

  console.log('\n🔍 Navigate to /huddles → My Huddles tab to see the dropdown!');
  console.log('💡 You should see 4 cards + a "+ X MORE" button\n');
}

addUserToHuddles()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
