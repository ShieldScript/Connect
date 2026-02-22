import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding test groups...\n');

  try {
    // Get a person to be the creator
    const person = await prisma.person.findFirst({
      where: { onboardingLevel: { gte: 1 } },
    });

    if (!person) {
      console.log('❌ No onboarded persons found. Please create a user first.');
      return;
    }

    console.log(`✅ Found person: ${person.displayName}`);

    // Calgary area test groups
    const testGroups = [
      {
        name: "Calgary Men's Hiking Group",
        description: "Weekly hikes in the Canadian Rockies. All skill levels welcome.",
        type: 'HOBBY' as const,
        latitude: 51.0447,
        longitude: -114.0719,
        isVirtual: false,
        currentSize: 8,
        maxSize: 12,
        tags: ['hiking', 'outdoors', 'fitness'],
        status: 'ACTIVE' as const,
        createdBy: person.id,
        leaderIds: [person.id],
      },
      {
        name: "Downtown Tech & Faith Discussion",
        description: "Exploring the intersection of technology, ethics, and spirituality.",
        type: 'SPIRITUAL' as const,
        latitude: 51.0486,
        longitude: -114.0708,
        isVirtual: false,
        currentSize: 15,
        maxSize: 20,
        tags: ['tech', 'faith', 'discussion'],
        status: 'ACTIVE' as const,
        createdBy: person.id,
        leaderIds: [person.id],
      },
      {
        name: "Kensington Board Game Night",
        description: "Weekly strategy games and social connection.",
        type: 'SOCIAL' as const,
        latitude: 51.0531,
        longitude: -114.0854,
        isVirtual: false,
        currentSize: 6,
        maxSize: 8,
        tags: ['board games', 'social', 'gaming'],
        status: 'ACTIVE' as const,
        createdBy: person.id,
        leaderIds: [person.id],
      },
      {
        name: "Virtual Men's Book Club",
        description: "Monthly book discussions on Zoom. Currently reading Tolkien.",
        type: 'SOCIAL' as const,
        latitude: null,
        longitude: null,
        isVirtual: true,
        currentSize: 12,
        maxSize: null,
        tags: ['books', 'discussion', 'online'],
        status: 'ACTIVE' as const,
        createdBy: person.id,
        leaderIds: [person.id],
      },
      {
        name: "NW Calgary Woodworking Shop",
        description: "Share tools, skills, and projects in a community workshop.",
        type: 'PROFESSIONAL' as const,
        latitude: 51.1056,
        longitude: -114.1321,
        isVirtual: false,
        currentSize: 5,
        maxSize: 10,
        tags: ['woodworking', 'crafts', 'skills'],
        status: 'ACTIVE' as const,
        createdBy: person.id,
        leaderIds: [person.id],
      },
    ];

    for (const group of testGroups) {
      const created = await prisma.group.create({
        data: group,
      });
      console.log(`✅ Created group: ${created.name}`);
    }

    console.log('\n✨ Test groups seeded successfully!');
    console.log('\nYou can now:');
    console.log('  1. Visit http://localhost:3000/groups');
    console.log('  2. See groups on the map and in the list');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
