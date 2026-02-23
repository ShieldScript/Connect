import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkCircles() {
  try {
    const groups = await prisma.group.findMany({
      where: { status: 'ACTIVE' },
      select: {
        name: true,
        type: true,
        isVirtual: true,
        currentSize: true,
        maxSize: true,
      },
      orderBy: [
        { isVirtual: 'desc' },
        { name: 'asc' }
      ]
    });

    const virtual = groups.filter(g => g.isVirtual);
    const physical = groups.filter(g => !g.isVirtual);

    console.log('Total active groups:', groups.length);
    console.log('\n📱 ONLINE CIRCLES:', virtual.length);
    if (virtual.length > 0) {
      virtual.forEach(g => {
        console.log(`   - ${g.name} (${g.type}) - ${g.currentSize}/${g.maxSize || '∞'} members`);
      });
    } else {
      console.log('   (none)');
    }

    console.log('\n📍 NEARBY CIRCLES:', physical.length);
    physical.forEach(g => {
      console.log(`   - ${g.name} (${g.type}) - ${g.currentSize}/${g.maxSize || '∞'} members`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkCircles();
