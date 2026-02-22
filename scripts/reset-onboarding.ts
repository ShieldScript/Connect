import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetOnboarding() {
  const client = await pool.connect();
  try {
    // Reset onboarding level to 0 for all users
    const result = await client.query(`
      UPDATE "Person"
      SET "onboardingLevel" = 0,
          "updatedAt" = NOW()
      WHERE "onboardingLevel" >= 1
      RETURNING id, email, "displayName", "onboardingLevel"
    `);

    console.log(`✅ Reset onboarding for ${result.rowCount} person(s):`);
    result.rows.forEach(row => {
      console.log(`  - ${row.displayName || row.email} (ID: ${row.id})`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

resetOnboarding().catch(console.error);
