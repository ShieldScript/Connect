import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Syncing all Person locations to PostGIS geography column...\n');

  // Update all persons with latitude/longitude to trigger the sync
  const result = await prisma.$executeRaw`
    UPDATE "Person"
    SET "updatedAt" = NOW()
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND location IS NULL
  `;

  console.log(`✅ Updated ${result} persons to trigger geography sync`);

  // Verify the sync worked
  const verified = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*) as total,
      COUNT(location) as with_geography
    FROM "Person"
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
  `;

  console.log('\n📊 Verification:');
  console.log(`  Total persons with lat/lng: ${verified[0].total}`);
  console.log(`  Persons with geography: ${verified[0].with_geography}`);

  if (verified[0].total === verified[0].with_geography) {
    console.log('\n✅ All locations synced successfully!');
  } else {
    console.log('\n⚠️  Some locations failed to sync. Check the trigger.');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
