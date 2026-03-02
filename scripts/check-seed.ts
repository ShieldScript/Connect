import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const categories = await prisma.interestCategory.findMany({
    include: { _count: { select: { activities: true } } },
    orderBy: { order: 'asc' },
  });

  console.log('\n📋 Seeded Categories:\n');
  categories.forEach((cat) => {
    console.log(`  ${cat.order}. ${cat.name} (${cat._count.activities} activities)`);
  });

  await prisma.$disconnect();
  await pool.end();
}

check();
