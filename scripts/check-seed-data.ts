import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('📊 Checking database seed data...\n');

  const personCount = await prisma.person.count();
  const personsWithLocation = await prisma.person.count({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
  });

  const groupCount = await prisma.group.count();
  const groupsWithLocation = await prisma.group.count({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
  });

  console.log('👥 Persons:');
  console.log(`  Total: ${personCount}`);
  console.log(`  With location: ${personsWithLocation}`);

  console.log('\n🔥 Groups:');
  console.log(`  Total: ${groupCount}`);
  console.log(`  With location: ${groupsWithLocation}`);

  if (personsWithLocation === 0) {
    console.log('\n⚠️  WARNING: No persons have location data!');
    console.log('   The map will be empty until persons have latitude/longitude.');
  }

  // Show sample persons
  const persons = await prisma.person.findMany({
    take: 3,
    select: {
      displayName: true,
      latitude: true,
      longitude: true,
      onboardingLevel: true,
    },
  });

  console.log('\n📋 Sample persons:');
  persons.forEach(p => {
    console.log(`  - ${p.displayName}: lat=${p.latitude}, lng=${p.longitude}, onboarding=${p.onboardingLevel}`);
  });

  // Show groups
  const groups = await prisma.group.findMany({
    select: {
      name: true,
      latitude: true,
      longitude: true,
      isVirtual: true,
    },
  });

  console.log('\n📋 Groups:');
  groups.forEach(g => {
    console.log(`  - ${g.name}: lat=${g.latitude}, lng=${g.longitude}, virtual=${g.isVirtual}`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
