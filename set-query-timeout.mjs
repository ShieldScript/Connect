import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.MIGRATION_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL not found');
  process.exit(1);
}

async function setQueryTimeout() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✓ Connected to database');
    
    // Set statement timeout for all queries (30 seconds)
    console.log('\n📋 Setting statement timeout to 30 seconds...');
    await client.query(`
      ALTER DATABASE postgres SET statement_timeout = '30s';
    `);
    console.log('✓ Statement timeout set');
    
    // Check current settings
    console.log('\n📋 Checking timeout settings...');
    const settings = await client.query(`
      SELECT name, setting, unit 
      FROM pg_settings 
      WHERE name IN ('statement_timeout', 'idle_in_transaction_session_timeout');
    `);
    
    settings.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.setting}${row.unit || ''}`);
    });
    
    console.log('\n✅ Query timeout configured successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    // This might fail on managed databases, which is OK
    console.log('\nNote: This is optional and may not work on managed databases.');
  } finally {
    await client.end();
  }
}

setQueryTimeout();
