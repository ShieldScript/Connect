import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTriggers() {
  const client = await pool.connect();
  try {
    // Check for triggers on Person table
    const triggersQuery = `
      SELECT
        trigger_name,
        event_manipulation,
        action_statement,
        action_timing
      FROM information_schema.triggers
      WHERE event_object_table = 'Person'
      ORDER BY trigger_name;
    `;

    const triggers = await client.query(triggersQuery);
    console.log('=== Triggers on Person table ===');
    console.log(JSON.stringify(triggers.rows, null, 2));

    // Check if location column exists
    const columnsQuery = `
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'Person'
      AND column_name IN ('location', 'latitude', 'longitude')
      ORDER BY column_name;
    `;

    const columns = await client.query(columnsQuery);
    console.log('\n=== Location-related columns ===');
    console.log(JSON.stringify(columns.rows, null, 2));

  } finally {
    client.release();
    await pool.end();
  }
}

checkTriggers().catch(console.error);
