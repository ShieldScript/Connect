import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.MIGRATION_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL not found');
  process.exit(1);
}

async function addSpatialIndex() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✓ Connected to database');
    
    // Create GIST index on location column for fast spatial queries
    console.log('\n📋 Creating spatial index on location column...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Person_location_gist_idx" 
      ON "Person" USING GIST (location);
    `);
    console.log('✓ Spatial index created');
    
    // Create additional helpful indexes
    console.log('\n📋 Creating additional indexes...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Person_onboardingLevel_idx" 
      ON "Person" ("onboardingLevel");
    `);
    console.log('✓ Index on onboardingLevel created');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS "Person_location_not_null_idx" 
      ON "Person" (location) WHERE location IS NOT NULL;
    `);
    console.log('✓ Partial index on non-null locations created');
    
    // Show existing indexes
    console.log('\n📋 Existing indexes on Person table:');
    const indexes = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'Person'
      ORDER BY indexname;
    `);
    
    indexes.rows.forEach(row => {
      console.log(`  - ${row.indexname}`);
    });
    
    console.log('\n✅ All indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addSpatialIndex();
