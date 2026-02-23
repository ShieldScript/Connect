import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

// Use the migration URL (direct connection with prepared statements support)
const connectionString = process.env.MIGRATION_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL or DIRECT_URL not found in environment');
  process.exit(1);
}

async function applyRLSPolicies() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Read and execute core RLS policies
    console.log('\n📋 Applying core RLS policies...');
    const coreSQL = fs.readFileSync('supabase-rls-core.sql', 'utf8');
    await client.query(coreSQL);
    console.log('✓ Core RLS policies applied');

    // Read and execute prayer wall RLS policies
    console.log('\n📋 Applying prayer wall RLS policies...');
    const prayerSQL = fs.readFileSync('supabase-rls-prayers.sql', 'utf8');
    await client.query(prayerSQL);
    console.log('✓ Prayer wall RLS policies applied');

    console.log('\n✅ All RLS policies applied successfully!');
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyRLSPolicies();
