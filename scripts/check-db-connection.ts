/**
 * Test database connection and show current config
 * Run with: npx tsx scripts/check-db-connection.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('🔍 Checking database connection...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✓ Set (Transaction pooler - for app)' : '✗ Missing');
  console.log('  MIGRATION_URL:', process.env.MIGRATION_URL ? '✓ Set (Session pooler - for migrations)' : '✗ Missing');
  console.log('  DIRECT_URL:', process.env.DIRECT_URL ? '✓ Set (Direct - not used)' : '✗ Missing');

  if (process.env.DATABASE_URL?.includes('[PASSWORD]')) {
    console.log('\n❌ ERROR: DATABASE_URL still contains [PASSWORD] placeholder');
    console.log('\n📝 To fix:');
    console.log('1. Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/settings/database');
    console.log('2. Find "Connection string" section');
    console.log('3. Select "Transaction" mode from dropdown');
    console.log('4. Copy the URI (should have port 6543)');
    console.log('5. Paste into .env as DATABASE_URL');
    console.log('\n6. Switch dropdown to "Direct connection"');
    console.log('7. Copy that URI (should have port 5432)');
    console.log('8. Paste into .env as DIRECT_URL');
    process.exit(1);
  }

  // Test connection
  try {
    await prisma.$connect();
    console.log('\n✅ Database connection successful!');

    // Try a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('\n📊 Database info:', result);

    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('\n📁 Existing tables:', tables);

    if (Array.isArray(tables) && tables.length === 0) {
      console.log('\n⚠️  No tables found. Run migrations with:');
      console.log('   npx prisma migrate dev --name init');
    }

    // Check if PostGIS is enabled
    try {
      const postgis = await prisma.$queryRaw`SELECT PostGIS_version()`;
      console.log('\n🗺️  PostGIS version:', postgis);
    } catch (e) {
      console.log('\n⚠️  PostGIS not enabled. Run setup-postgis.sql in Supabase SQL Editor');
    }

  } catch (error) {
    console.log('\n❌ Database connection failed!');
    console.error('Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('password authentication failed')) {
        console.log('\n💡 Tip: Check your database password in .env');
      } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
        console.log('\n💡 Tip: Check the database URL hostname');
      } else if (error.message.includes('timeout')) {
        console.log('\n💡 Tip: Check your internet connection and Supabase status');
      }
    }

    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
