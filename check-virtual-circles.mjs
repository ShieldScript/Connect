import pg from 'pg';
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();

  const result = await client.query(`
    SELECT name, type, "isVirtual", "currentSize", "maxSize"
    FROM "Group"
    WHERE status = 'ACTIVE'
    ORDER BY "isVirtual" DESC, name
  `);

  console.log('Total active groups:', result.rows.length);

  const virtual = result.rows.filter(g => g.isVirtual);
  const physical = result.rows.filter(g => !g.isVirtual);

  console.log('\n📱 ONLINE CIRCLES:', virtual.length);
  if (virtual.length > 0) {
    virtual.forEach(g => console.log('  -', g.name, `(${g.type})`));
  }

  console.log('\n📍 NEARBY CIRCLES:', physical.length);
  physical.forEach(g => console.log('  -', g.name, `(${g.type})`));

} catch (error) {
  console.error('Error:', error.message);
} finally {
  await client.end();
}
