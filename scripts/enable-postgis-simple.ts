import { Pool } from 'pg';

async function enablePostGIS() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🗺️  Enabling PostGIS extension...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS extension enabled');

    const result = await pool.query('SELECT PostGIS_Version();');
    console.log('📊 PostGIS version:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

enablePostGIS();
