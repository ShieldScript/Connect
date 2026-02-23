import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL;

async function checkLocationData() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✓ Connected to database\n');
    
    // Check persons with location data
    console.log('=== PERSONS ===');
    const persons = await client.query(`
      SELECT 
        "displayName", 
        latitude, 
        longitude,
        location IS NOT NULL as has_geography,
        "onboardingLevel"
      FROM "Person" 
      WHERE "onboardingLevel" >= 1
      LIMIT 10
    `);
    
    console.log(`Total onboarded persons: ${persons.rows.length}`);
    console.log('Sample data:');
    persons.rows.forEach(p => {
      console.log(`  ${p.displayName}: lat=${p.latitude}, lng=${p.longitude}, geography=${p.has_geography}`);
    });
    
    const withLocation = persons.rows.filter(p => p.latitude && p.longitude);
    console.log(`\nPersons with lat/lng: ${withLocation.length}`);
    
    const withGeography = persons.rows.filter(p => p.has_geography);
    console.log(`Persons with PostGIS location: ${withGeography.length}\n`);
    
    // Check groups with location data
    console.log('=== GROUPS/CIRCLES ===');
    const groups = await client.query(`
      SELECT 
        name, 
        category,
        latitude, 
        longitude,
        location IS NOT NULL as has_geography,
        "isPublic",
        status
      FROM "Group" 
      WHERE status = 'ACTIVE' AND "isPublic" = true
      LIMIT 10
    `);
    
    console.log(`Total public active groups: ${groups.rows.length}`);
    console.log('Sample data:');
    groups.rows.forEach(g => {
      console.log(`  ${g.name} (${g.category}): lat=${g.latitude}, lng=${g.longitude}, geography=${g.has_geography}`);
    });
    
    const groupsWithLocation = groups.rows.filter(g => g.latitude && g.longitude);
    console.log(`\nGroups with lat/lng: ${groupsWithLocation.length}`);
    
    const groupsWithGeography = groups.rows.filter(g => g.has_geography);
    console.log(`Groups with PostGIS location: ${groupsWithGeography.length}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkLocationData();
