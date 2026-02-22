import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Checking if Person.location geography column is synced...\n');

  const persons = await prisma.$queryRaw<any[]>`
    SELECT
      "displayName",
      latitude,
      longitude,
      CASE WHEN location IS NULL THEN 'NO' ELSE 'YES' END as has_geography
    FROM "Person"
    WHERE latitude IS NOT NULL
    ORDER BY "displayName"
    LIMIT 10
  `;

  console.log('📊 Results:');
  persons.forEach(p => {
    console.log(`  ${p.displayName}: lat=${p.latitude}, lng=${p.longitude}, geography=${p.has_geography}`);
  });

  const withoutGeography = persons.filter(p => p.has_geography === 'NO').length;

  if (withoutGeography > 0) {
    console.log(`\n⚠️  WARNING: ${withoutGeography} persons have lat/lng but NO geography column!`);
    console.log('   This means proximity queries will not find them.');
    console.log('\n💡 Solution: Update all persons to trigger the location sync:');
    console.log('   Run: npx tsx scripts/sync-all-locations.ts');
  } else {
    console.log('\n✅ All persons have geography column synced!');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
