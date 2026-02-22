import 'dotenv/config'; // Load environment variables
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { interests } from './interests-seed-data';

// Use Session pooler for seeding (supports prepared statements)
const connectionString = process.env.MIGRATION_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: MIGRATION_URL or DATABASE_URL not found in environment variables');
  console.error('Make sure .env file exists and contains database connection strings');
  process.exit(1);
}

console.log('Using connection:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed database with comprehensive Interest data
 * 8 main categories optimized for male bonding and ministry formation
 */

async function main() {
  console.log('🌱 Seeding database with comprehensive interests taxonomy...');

  // Clear existing interests (optional - comment out to preserve existing data)
  console.log('Clearing existing interests...');
  await prisma.personInterest.deleteMany({});
  await prisma.interest.deleteMany({});

  // Seed interests from comprehensive taxonomy
  console.log(`Seeding ${interests.length} interests across 8 main categories...`);

  for (const interest of interests) {
    await prisma.interest.create({
      data: {
        name: interest.name,
        category: interest.category,
        description: interest.description,
        popularity: interest.popularity,
        metadata: interest.metadata,
      },
    });
  }

  console.log('✅ Seeding complete!');
  console.log(`Total interests seeded: ${interests.length}`);

  // Display category breakdown
  const categories = interests.reduce((acc, interest) => {
    acc[interest.category] = (acc[interest.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nCategory breakdown:');
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count} interests`);
    });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
