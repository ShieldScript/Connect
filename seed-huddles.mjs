import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding huddles...\n');

  // Get existing users to use as creators
  const users = await prisma.person.findMany({
    take: 5,
    select: {
      id: true,
      displayName: true,
    },
  });

  if (users.length === 0) {
    console.error('❌ No users found. Please create users first.');
    return;
  }

  const huddles = [
    {
      name: 'Northwest Calgary Men',
      description: 'Accountability group for men in NW Calgary focusing on work-life balance, marriage, and spiritual growth.',
      createdBy: users[0].id,
      maxSize: 6,
      currentSize: 3,
      memberCount: 3,
    },
    {
      name: 'Early Morning Warriors',
      description: 'Meet weekly at 6am for prayer, scripture study, and mutual encouragement. Focused on starting the day right.',
      createdBy: users[1]?.id || users[0].id,
      maxSize: 5,
      currentSize: 4,
      memberCount: 4,
    },
    {
      name: 'Tech Bros for Jesus',
      description: 'Software engineers and tech workers seeking to honor God in our careers and navigate the challenges of tech culture.',
      createdBy: users[2]?.id || users[0].id,
      maxSize: 6,
      currentSize: 2,
      memberCount: 2,
    },
    {
      name: 'Young Fathers Circle',
      description: 'New dads (kids under 5) learning to lead our families well. Biblical parenting, marriage, and being present.',
      createdBy: users[3]?.id || users[0].id,
      maxSize: 6,
      currentSize: 5,
      memberCount: 5,
    },
    {
      name: 'Overcoming Anxiety & Fear',
      description: 'Safe space for brothers struggling with anxiety, worry, and fear. We share struggles and pray for each other.',
      createdBy: users[4]?.id || users[0].id,
      maxSize: 4,
      currentSize: 1,
      memberCount: 1,
    },
    {
      name: 'Business Builders',
      description: 'Entrepreneurs and business owners seeking to build companies that honor God and serve others well.',
      createdBy: users[0].id,
      maxSize: 6,
      currentSize: 2,
      memberCount: 2,
    },
  ];

  for (const huddleData of huddles) {
    const { memberCount, ...createData } = huddleData;

    const huddle = await prisma.group.create({
      data: {
        ...createData,
        type: 'SPIRITUAL',
        category: 'HUDDLE',
        isVirtual: true,
        minSize: 3,
        isPublic: true,
        status: 'ACTIVE',
      },
    });

    // Add creator as first member
    await prisma.groupMembership.create({
      data: {
        groupId: huddle.id,
        personId: createData.createdBy,
        role: 'LEADER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
    });

    // Add additional members if specified
    const membersToAdd = memberCount - 1; // -1 because creator is already added
    if (membersToAdd > 0) {
      for (let i = 0; i < membersToAdd && i < users.length - 1; i++) {
        const memberId = users[i + 1]?.id || users[0].id;

        // Check if this person is already a member
        const existing = await prisma.groupMembership.findFirst({
          where: {
            groupId: huddle.id,
            personId: memberId,
          },
        });

        if (!existing) {
          await prisma.groupMembership.create({
            data: {
              groupId: huddle.id,
              personId: memberId,
              role: 'MEMBER',
              status: 'ACTIVE',
              joinedAt: new Date(),
            },
          });
        }
      }
    }

    console.log(`✅ Created huddle: "${huddle.name}" (${memberCount}/${huddle.maxSize} members)`);
  }

  console.log('\n🎉 Huddle seeding complete!\n');
  console.log('Run the app and navigate to /huddles → Discover tab to see them.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding huddles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
