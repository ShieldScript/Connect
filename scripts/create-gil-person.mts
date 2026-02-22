import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createGilPerson() {
  try {
    const person = await prisma.person.create({
      data: {
        supabaseUserId: '140fc8de-7f52-4a11-9151-35a4decc5575',
        email: 'gil.motina@servingtheking.com',
        displayName: 'Gil Motina',
        onboardingLevel: 1,
        proximityRadiusKm: 5,
        city: 'Toronto',
        region: 'Ontario',
        latitude: 43.6532,
        longitude: -79.3832,
        archetype: 'Builder',
        connectionStyle: 'workshop',
      }
    });

    console.log('✅ Created Person record for Gil Motina');
    console.log(`   ID: ${person.id}`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createGilPerson();
