import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const sql = `
      ALTER TABLE "Group"
      ADD COLUMN IF NOT EXISTS "locationName" TEXT;
    `;

    await client.query(sql);
    console.log('✅ Added locationName column to Group table');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

main();
