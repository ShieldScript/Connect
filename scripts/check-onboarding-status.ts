import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkStatus() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT id, "displayName", email, "onboardingLevel"
      FROM "Person"
      ORDER BY "createdAt" DESC
    `);

    console.log(`\n📊 Current Person Records (${result.rowCount} total):\n`);
    result.rows.forEach(row => {
      console.log(`  ${row.displayName} (${row.email})`);
      console.log(`  └─ Onboarding Level: ${row.onboardingLevel}`);
      console.log(`  └─ ID: ${row.id}\n`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

checkStatus().catch(console.error);
