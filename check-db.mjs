import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkDatabase() {
  try {
    const [personCount, interestCount, groupCount, membershipCount] = await Promise.all([
      prisma.person.count(),
      prisma.interest.count(),
      prisma.group.count(),
      prisma.groupMembership.count(),
    ]);

    console.log('✅ Database Connection Successful\n');
    console.log('📊 Current Database Statistics:');
    console.log(`   - Persons: ${personCount}`);
    console.log(`   - Interests: ${interestCount}`);
    console.log(`   - Groups: ${groupCount}`);
    console.log(`   - Memberships: ${membershipCount}\n`);

    if (personCount > 0) {
      console.log('✅ Database already has seed data - ready to use!');
    } else {
      console.log('⚠️  No seed data found.');
    }
  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkDatabase();
