import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL;

async function checkCircles() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✓ Connected to database\n');
    
    const result = await client.query(`
      SELECT 
        name,
        type,
        "isVirtual",
        latitude,
        longitude,
        status,
        "currentSize",
        "maxSize"
      FROM "Group"
      WHERE status = 'ACTIVE'
      ORDER BY "isVirtual" DESC, name
    `);
    
    console.log(`Total active groups: ${result.rows.length}\n`);
    
    const virtual = result.rows.filter(g => g.isVirtual);
    const physical = result.rows.filter(g => !g.isVirtual);
    
    console.log(`📱 ONLINE CIRCLES (${virtual.length}):`);
    if (virtual.length === 0) {
      console.log('  (none)\n');
    } else {
      virtual.forEach(g => {
        console.log(`  - ${g.name} (${g.type}) - ${g.currentSize}/${g.maxSize || '∞'} members`);
      });
      console.log('');
    }
    
    console.log(`📍 NEARBY CIRCLES (${physical.length}):`);
    physical.forEach(g => {
      const hasLocation = g.latitude && g.longitude ? '✓' : '✗';
      console.log(`  ${hasLocation} ${g.name} (${g.type}) - ${g.currentSize}/${g.maxSize || '∞'} members`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCircles();
