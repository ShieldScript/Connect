/**
 * Enable PostGIS extension and setup geography columns
 * Run with: npx tsx scripts/enable-postgis.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Use Session pooler for migrations/setup (supports prepared statements)
const pool = new Pool({ connectionString: process.env.MIGRATION_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🗺️  Enabling PostGIS extension...\n');

  try {
    // Enable PostGIS extension
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS extension enabled');

    // Verify PostGIS installation
    const version = await prisma.$queryRawUnsafe('SELECT PostGIS_version();');
    console.log('📊 PostGIS version:', version);

    // Add geography column to Person table
    console.log('\n📍 Adding location columns...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Person"
      ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);
    `);
    console.log('✅ Added location column to Person table');

    // Create spatial index for Person
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_person_location
      ON "Person" USING GIST(location);
    `);
    console.log('✅ Created spatial index on Person.location');

    // Add geography column to Group table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Group"
      ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);
    `);
    console.log('✅ Added location column to Group table');

    // Create spatial index for Group
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_group_location
      ON "Group" USING GIST(location);
    `);
    console.log('✅ Created spatial index on Group.location');

    // Create function to auto-sync lat/lng to geography for Person
    console.log('\n🔧 Creating auto-sync triggers...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION sync_person_location()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
          NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS person_location_sync ON "Person";
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER person_location_sync
        BEFORE INSERT OR UPDATE ON "Person"
        FOR EACH ROW
        EXECUTE FUNCTION sync_person_location();
    `);
    console.log('✅ Created trigger for Person.location auto-sync');

    // Create function to auto-sync lat/lng to geography for Group
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION sync_group_location()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
          NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS group_location_sync ON "Group";
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER group_location_sync
        BEFORE INSERT OR UPDATE ON "Group"
        FOR EACH ROW
        EXECUTE FUNCTION sync_group_location();
    `);
    console.log('✅ Created trigger for Group.location auto-sync');

    console.log('\n✨ PostGIS setup complete!');
    console.log('\nYou can now:');
    console.log('  1. Run: npm run db:seed (to populate interests)');
    console.log('  2. Run: npm run dev (to start the dev server)');

  } catch (error) {
    console.error('\n❌ PostGIS setup failed:', error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
