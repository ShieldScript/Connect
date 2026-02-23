import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.MIGRATION_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL not found');
  process.exit(1);
}

async function disableRLS() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✓ Connected to database');
    
    const tables = [
      'Person',
      'Interest', 
      'PersonInterest',
      'Group',
      'GroupMembership',
      'HuddleMessage',
      'SafetyReport',
      'CompatibilityScore',
      'PrayerPost',
      'PrayerResponse',
      'Notification'
    ];
    
    console.log('\n📋 Disabling RLS on all tables...\n');
    
    for (const table of tables) {
      await client.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
      console.log(`✓ Disabled RLS on ${table}`);
    }
    
    console.log('\n✅ RLS disabled on all tables!');
    console.log('\nℹ️  Server-side API routes will now have full database access');
    console.log('   Client-side access is still protected by API authentication');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

disableRLS();
