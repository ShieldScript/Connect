/**
 * Database Cleanup Script
 *
 * Removes corrupted custom entries where:
 * - type/style is CUSTOM but customName is null/empty
 * - These are orphaned entries from the customLabel bug
 *
 * Run with: npx tsx scripts/clean-corrupt-data.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function cleanCorruptedData() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Clean Natural Giftings
    const deletedNaturalGiftings = await prisma.personNaturalGifting.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedNaturalGiftings.count} corrupted Natural Giftings`);

    // Clean Supernatural Giftings
    const deletedSupernaturalGiftings = await prisma.personSupernaturalGifting.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedSupernaturalGiftings.count} corrupted Supernatural Giftings`);

    // Clean Ministry Experiences
    const deletedMinistryExperiences = await prisma.personMinistryExperience.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedMinistryExperiences.count} corrupted Ministry Experiences`);

    // Clean Milestones
    const deletedMilestones = await prisma.personMilestone.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedMilestones.count} corrupted Milestones`);

    // Clean Growth Areas
    const deletedGrowthAreas = await prisma.personGrowthArea.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedGrowthAreas.count} corrupted Growth Areas`);

    // Clean Leadership Patterns
    const deletedLeadershipPatterns = await prisma.personLeadershipPattern.deleteMany({
      where: {
        style: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedLeadershipPatterns.count} corrupted Leadership Patterns`);

    // Clean Life Stages
    const deletedLifeStages = await prisma.personLifeStage.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedLifeStages.count} corrupted Life Stages`);

    // Clean Callings
    const deletedCallings = await prisma.personCalling.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedCallings.count} corrupted Callings`);

    // Clean Healing Themes
    const deletedHealingThemes = await prisma.personHealingTheme.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedHealingThemes.count} corrupted Healing Themes`);

    // Clean Practices
    const deletedPractices = await prisma.personPractice.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedPractices.count} corrupted Practices`);

    // Clean Boundaries
    const deletedBoundaries = await prisma.personBoundary.deleteMany({
      where: {
        type: 'CUSTOM',
        OR: [
          { customName: null },
          { customName: '' },
        ],
      },
    });
    console.log(`✅ Deleted ${deletedBoundaries.count} corrupted Boundaries`);

    const totalDeleted =
      deletedNaturalGiftings.count +
      deletedSupernaturalGiftings.count +
      deletedMinistryExperiences.count +
      deletedMilestones.count +
      deletedGrowthAreas.count +
      deletedLeadershipPatterns.count +
      deletedLifeStages.count +
      deletedCallings.count +
      deletedHealingThemes.count +
      deletedPractices.count +
      deletedBoundaries.count;

    console.log(`\n🎉 Cleanup complete! Removed ${totalDeleted} total corrupted entries.`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

cleanCorruptedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
