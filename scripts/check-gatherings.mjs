import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT id, name, "locationName", "isVirtual", latitude, longitude, status, "createdAt"
      FROM "Group"
      ORDER BY "createdAt" DESC
      LIMIT 10;
    `);

    console.log('\n📍 Gatherings in database:');
    console.log('Total:', result.rowCount);

    if (result.rows.length === 0) {
      console.log('\n❌ No gatherings found in database');
    } else {
      result.rows.forEach((row, i) => {
        console.log(`\n${i + 1}. ${row.name}`);
        console.log(`   Location: ${row.locationName || 'N/A'}`);
        console.log(`   Type: ${row.isVirtual ? 'Virtual' : 'Physical'}`);
        console.log(`   Coords: ${row.latitude}, ${row.longitude}`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Created: ${row.createdAt}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
