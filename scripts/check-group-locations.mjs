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
      SELECT
        id,
        name,
        latitude,
        longitude,
        location IS NOT NULL as has_postgis_location
      FROM "Group"
      ORDER BY "createdAt" DESC;
    `);

    console.log('\n📍 Group location status:');
    result.rows.forEach((row) => {
      console.log(`\n${row.name}`);
      console.log(`  Lat/Lng: ${row.latitude}, ${row.longitude}`);
      console.log(`  PostGIS location: ${row.has_postgis_location ? '✅ SET' : '❌ NOT SET'}`);
    });

    const missingLocation = result.rows.filter(r => !r.has_postgis_location);
    if (missingLocation.length > 0) {
      console.log(`\n\n⚠️  ${missingLocation.length} gatherings missing PostGIS location column`);
      console.log('These will not show up in proximity search!');
      console.log('\nFix by running:');
      console.log('UPDATE "Group" SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography WHERE latitude IS NOT NULL AND longitude IS NOT NULL;');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
