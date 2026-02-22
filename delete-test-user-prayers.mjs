import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🗑️  Deleting prayers from test users...\n');

  const testUserNames = ['Paul Lau', 'Allen Chi', 'Gil Molina', 'Gil Motina'];

  // Find test users
  const testUsers = await prisma.person.findMany({
    where: {
      displayName: {
        in: testUserNames,
      },
    },
    select: {
      id: true,
      displayName: true,
    },
  });

  if (testUsers.length === 0) {
    console.log('✅ No test users found. Nothing to delete.');
    return;
  }

  console.log(`Found ${testUsers.length} test users:`);
  testUsers.forEach(u => console.log(`  - ${u.displayName}`));
  console.log('');

  const testUserIds = testUsers.map(u => u.id);

  // Delete prayer responses first (foreign key constraint)
  const deletedResponses = await prisma.prayerResponse.deleteMany({
    where: {
      prayerPost: {
        authorId: {
          in: testUserIds,
        },
      },
    },
  });

  console.log(`✅ Deleted ${deletedResponses.count} prayer responses`);

  // Delete prayer posts
  const deletedPrayers = await prisma.prayerPost.deleteMany({
    where: {
      authorId: {
        in: testUserIds,
      },
    },
  });

  console.log(`✅ Deleted ${deletedPrayers.count} prayer posts`);
  console.log('\n🎉 Cleanup complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error deleting prayers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
