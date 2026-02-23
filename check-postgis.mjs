import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.MIGRATION_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL not found');
  process.exit(1);
}

async function checkPostGIS() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✓ Connected to database');
    
    // Check if PostGIS extension is installed
    const result = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = 'postgis';
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ PostGIS extension is installed:', result.rows[0]);
    } else {
      console.log('❌ PostGIS extension is NOT installed');
      console.log('Installing PostGIS extension...');
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
      console.log('✓ PostGIS extension installed successfully');
    }
    
    // Check if location column uses geography type
    const columnCheck = await client.query(`
      SELECT column_name, udt_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Person' AND column_name = 'location';
    `);
    
    console.log('Location column info:', columnCheck.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkPostGIS();
