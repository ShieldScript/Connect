import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkSeedData() {
  try {
    console.log('🔍 Checking seed data...\n');

    // Check persons
    const persons = await prisma.person.findMany({
      select: {
        id: true,
        supabaseUserId: true,
        email: true,
        displayName: true,
        onboardingLevel: true,
      },
      take: 10,
    });

    console.log(`📊 Found ${persons.length} persons in database:`);
    persons.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.displayName} (${p.email})`);
      console.log(`     Supabase ID: ${p.supabaseUserId}`);
      console.log(`     Onboarding Level: ${p.onboardingLevel}\n`);
    });

    // Check interests count
    const interestCount = await prisma.interest.count();
    console.log(`📚 Total interests: ${interestCount}`);

    // Check groups count
    const groupCount = await prisma.group.count();
    console.log(`🏘️  Total groups: ${groupCount}`);

    // Check memberships count
    const membershipCount = await prisma.groupMembership.count();
    console.log(`👥 Total memberships: ${membershipCount}\n`);

    if (persons.length === 0) {
      console.log('❌ NO SEED DATA FOUND! Database is empty.');
      console.log('   Run: npx prisma db seed');
    } else {
      console.log('✅ Seed data is present in database!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkSeedData();
