#!/usr/bin/env node

import pg from 'pg';
import { config } from 'dotenv';

const { Client } = pg;

// Load environment variables
config();

const connectionString = process.env.MIGRATION_URL;

if (!connectionString) {
  console.error('❌ Missing MIGRATION_URL in .env');
  process.exit(1);
}

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('🔧 Adding proximityRadiusKm column to Person table...');

    const sql = `
      ALTER TABLE "Person"
      ADD COLUMN IF NOT EXISTS "proximityRadiusKm" INTEGER DEFAULT 5;
    `;

    await client.query(sql);
    console.log('✅ Column added successfully!');

    // Verify the column exists
    console.log('🔍 Verifying column exists...');
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'Person'
      AND column_name = 'proximityRadiusKm';
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verification passed!');
      console.log('Column details:', result.rows[0]);
    } else {
      console.log('⚠️  Column not found in verification query');
    }

    console.log('\n🎉 Migration complete! The app will now work properly.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

runMigration();
