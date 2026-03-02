/**
 * Database Inspection Script
 * Check for corrupted custom entries
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function inspectCorruptedData() {
  console.log('🔍 Inspecting database for corrupted custom entries...\n');

  try {
    // Check Leadership Patterns for numeric IDs in customName
    const leadershipPatterns = await prisma.personLeadershipPattern.findMany({
      where: {
        style: 'CUSTOM',
      },
      select: {
        id: true,
        personId: true,
        style: true,
        customName: true,
        frequency: true,
      },
    });

    console.log(`Found ${leadershipPatterns.length} custom leadership patterns:`);
    leadershipPatterns.forEach((pattern) => {
      const hasNumericId = /\d{10,}/.test(pattern.customName || '');
      const marker = hasNumericId ? '❌ CORRUPTED' : '✅ OK';
      console.log(`  ${marker} - customName: "${pattern.customName}"`);
    });

    // Check all other layers
    const layers = [
      { name: 'Natural Giftings', table: prisma.personNaturalGifting },
      { name: 'Supernatural Giftings', table: prisma.personSupernaturalGifting },
      { name: 'Ministry Experiences', table: prisma.personMinistryExperience },
      { name: 'Milestones', table: prisma.personMilestone },
      { name: 'Growth Areas', table: prisma.personGrowthArea },
      { name: 'Life Stages', table: prisma.personLifeStage },
      { name: 'Callings', table: prisma.personCalling },
      { name: 'Healing Themes', table: prisma.personHealingTheme },
      { name: 'Practices', table: prisma.personPractice },
      { name: 'Boundaries', table: prisma.personBoundary },
    ];

    for (const layer of layers) {
      const records = await layer.table.findMany({
        where: {
          type: 'CUSTOM',
        },
        select: {
          id: true,
          customName: true,
        },
      });

      if (records.length > 0) {
        console.log(`\n${layer.name}: ${records.length} custom entries`);
        records.forEach((record: any) => {
          const hasNumericId = /\d{10,}/.test(record.customName || '');
          const marker = hasNumericId ? '❌ CORRUPTED' : '✅ OK';
          console.log(`  ${marker} - customName: "${record.customName}"`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error during inspection:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

inspectCorruptedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
