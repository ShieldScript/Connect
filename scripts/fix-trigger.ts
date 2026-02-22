import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixTrigger() {
  const client = await pool.connect();
  try {
    // Drop the problematic trigger
    console.log('Dropping person_location_sync trigger...');
    await client.query('DROP TRIGGER IF EXISTS person_location_sync ON "Person"');
    console.log('✅ Trigger dropped successfully');

    // Also drop the function if it exists
    console.log('Dropping sync_person_location function...');
    await client.query('DROP FUNCTION IF EXISTS sync_person_location()');
    console.log('✅ Function dropped successfully');

    console.log('\n🎉 Database fixed! The onboarding form should work now.');

  } finally {
    client.release();
    await pool.end();
  }
}

fixTrigger().catch(console.error);
