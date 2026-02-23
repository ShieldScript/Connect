import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createOnlineCircles() {
  try {
    // Get some existing users to be creators
    const users = await prisma.person.findMany({
      where: { onboardingLevel: { gte: 1 } },
      take: 3,
    });

    if (users.length < 3) {
      console.log('❌ Need at least 3 onboarded users to create circles');
      return;
    }

    const onlineCircles = [
      {
        name: 'Global Prayer Warriors',
        description: 'Daily online prayer meetings for brothers around the world',
        type: 'SPIRITUAL',
        tags: ['prayer', 'faith', 'global'],
        maxSize: 50,
        createdBy: users[0].id,
      },
      {
        name: 'Tech Bros Connect',
        description: 'Weekly video calls for brothers in tech to share knowledge and support',
        type: 'PROFESSIONAL',
        tags: ['technology', 'career', 'networking'],
        maxSize: 30,
        createdBy: users[1].id,
      },
      {
        name: 'Virtual Book Club',
        description: 'Monthly online discussions on books about faith, leadership, and growth',
        type: 'SOCIAL',
        tags: ['books', 'learning', 'discussion'],
        maxSize: 20,
        createdBy: users[2].id,
      },
    ];

    for (const circleData of onlineCircles) {
      const circle = await prisma.group.create({
        data: {
          ...circleData,
          category: 'CIRCLE',
          isVirtual: true,
          isPublic: true,
          status: 'ACTIVE',
          currentSize: 1,
          locationName: 'Online',
          // No latitude/longitude for virtual circles
        },
      });

      // Add creator as first member
      await prisma.groupMembership.create({
        data: {
          groupId: circle.id,
          personId: circleData.createdBy,
          role: 'LEADER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });

      console.log(`✅ Created online circle: ${circle.name}`);
    }

    console.log('\n✅ Created 3 online circles successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createOnlineCircles();
