import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find Allen Chi
  const allen = await prisma.person.findFirst({
    where: { displayName: { contains: 'Allen' } },
    select: {
      displayName: true,
      email: true,
      latitude: true,
      longitude: true,
      community: true,
      city: true,
    },
  });

  console.log('📍 Allen Chi location:', allen);

  // Check nearby persons from Allen's location
  if (allen?.latitude && allen?.longitude) {
    const nearby = await prisma.$queryRaw<any[]>`
      SELECT
        p."displayName",
        p.latitude,
        p.longitude,
        ST_Distance(
          p.location::geography,
          ST_SetSRID(ST_MakePoint(${allen.longitude}, ${allen.latitude}), 4326)::geography
        ) / 1000 as "distanceKm"
      FROM "Person" p
      WHERE
        p."onboardingLevel" >= 1
        AND ST_DWithin(
          p.location::geography,
          ST_SetSRID(ST_MakePoint(${allen.longitude}, ${allen.latitude}), 4326)::geography,
          ${5 * 1000}
        )
        AND p.location IS NOT NULL
        AND p."displayName" != 'Allen Chi'
      ORDER BY "distanceKm" ASC
      LIMIT 20
    `;

    console.log(`\n👥 Found ${nearby.length} persons within 5km:`);
    nearby.forEach(p => {
      console.log(`  - ${p.displayName}: ${Number(p.distanceKm).toFixed(2)}km away`);
    });
  }

  // Check groups near Allen
  if (allen?.latitude && allen?.longitude) {
    const groups = await prisma.$queryRaw<any[]>`
      SELECT
        g.name,
        g.latitude,
        g.longitude,
        g."isVirtual",
        ST_Distance(
          g.location::geography,
          ST_SetSRID(ST_MakePoint(${allen.longitude}, ${allen.latitude}), 4326)::geography
        ) / 1000 as "distanceKm"
      FROM "Group" g
      WHERE
        g.status = 'ACTIVE'
        AND g."isPublic" = true
        AND ST_DWithin(
          g.location::geography,
          ST_SetSRID(ST_MakePoint(${allen.longitude}, ${allen.latitude}), 4326)::geography,
          ${5 * 1000}
        )
        AND g.location IS NOT NULL
      ORDER BY "distanceKm" ASC
    `;

    console.log(`\n🔥 Found ${groups.length} groups within 5km:`);
    groups.forEach(g => {
      console.log(`  - ${g.name}: ${Number(g.distanceKm).toFixed(2)}km away (virtual: ${g.isVirtual})`);
    });
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
