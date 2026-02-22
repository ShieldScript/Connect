#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addProximityColumn() {
  console.log('🔧 Adding proximityRadiusKm column to Person table...');

  const sql = `
    -- Add the column with default value of 5km
    ALTER TABLE "Person"
    ADD COLUMN IF NOT EXISTS "proximityRadiusKm" INTEGER DEFAULT 5;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { query: sql }).catch(() => ({
    data: null,
    error: { message: 'exec_sql function not available, trying direct approach' }
  }));

  if (error) {
    console.log('ℹ️  Standard RPC not available, using Postgres REST API...');

    // Try using the Postgres REST API via fetch
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    }).catch(() => null);

    if (!response || !response.ok) {
      console.log('\n⚠️  Cannot execute SQL directly through API.');
      console.log('\n📋 Please run this SQL manually in Supabase Dashboard → SQL Editor:');
      console.log('\n' + '='.repeat(60));
      console.log(sql);
      console.log('='.repeat(60) + '\n');
      process.exit(1);
    }
  }

  console.log('✅ Column added successfully!');

  // Verify the column exists
  const { data: columns, error: verifyError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, column_default')
    .eq('table_name', 'Person')
    .eq('column_name', 'proximityRadiusKm');

  if (!verifyError && columns) {
    console.log('✅ Verification: Column exists in database');
    console.log(columns);
  }

  console.log('\n🎉 Migration complete!');
}

addProximityColumn().catch(error => {
  console.error('❌ Migration failed:', error.message);
  console.log('\n📋 Please run this SQL manually in Supabase Dashboard → SQL Editor:');
  console.log('\n' + '='.repeat(60));
  console.log(`
-- Add the column with default value of 5km
ALTER TABLE "Person"
ADD COLUMN IF NOT EXISTS "proximityRadiusKm" INTEGER DEFAULT 5;

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Person'
AND column_name = 'proximityRadiusKm';
  `);
  console.log('='.repeat(60) + '\n');
  process.exit(1);
});
