import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use Session pooler for seeding (supports prepared statements)
const pool = new Pool({ connectionString: process.env.MIGRATION_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed database with demo persons (brothers) for testing
 * These persons do NOT have real Supabase auth accounts
 * They're for UI testing and demonstration only
 */

async function main() {
  console.log('🌱 Seeding demo persons...');

  const demoPersons = [
    {
      email: 'kaleb.demo@example.com',
      displayName: 'Kaleb',
      bio: 'Passionate about hands-on work and teaching practical skills. Love building things that last.',
      latitude: 51.045, // Calgary - Mission area
      longitude: -114.065,
      community: 'Mission',
      city: 'Calgary',
      region: 'AB',
      archetype: 'builder',
      connectionStyle: 'workshop',
      onboardingLevel: 1,
      interests: [
        { name: 'Woodworking & Carpentry', proficiencyLevel: 3 },
        { name: 'Home Renovation & Repair', proficiencyLevel: 2 }
      ]
    },
    {
      email: 'marcus.demo@example.com',
      displayName: 'Marcus',
      bio: 'Committed to walking alongside brothers in their journey. Available for deep conversations.',
      latitude: 51.055,
      longitude: -114.075,
      community: 'Inglewood',
      city: 'Calgary',
      region: 'AB',
      archetype: 'sage',
      connectionStyle: 'fireside',
      onboardingLevel: 1,
      interests: [
        { name: 'Spiritual Mentoring & Direction', proficiencyLevel: 3 },
        { name: 'Bible Study & Scripture', proficiencyLevel: 3 }
      ]
    },
    {
      email: 'david.demo@example.com',
      displayName: 'David',
      bio: 'Seeking to grow in faith and serve the community with discernment.',
      latitude: 51.035,
      longitude: -114.055,
      community: 'Ramsay',
      city: 'Calgary',
      region: 'AB',
      archetype: 'watchman',
      connectionStyle: 'fireside',
      onboardingLevel: 1,
      interests: [
        { name: 'Bible Study & Scripture', proficiencyLevel: 2 }
      ]
    },
    {
      email: 'aaron.demo@example.com',
      displayName: 'Aaron',
      latitude: 51.025,
      longitude: -114.045,
      community: 'Forest Lawn',
      city: 'Calgary',
      region: 'AB',
      archetype: 'steward',
      connectionStyle: 'workshop',
      onboardingLevel: 1,
      interests: [
        { name: 'Gardening & Homesteading', proficiencyLevel: 3 }
      ]
    },
    {
      email: 'james.demo@example.com',
      displayName: 'James',
      bio: 'Love working with my hands and creating functional art.',
      latitude: 51.050,
      longitude: -114.070,
      community: 'Bridgeland',
      city: 'Calgary',
      region: 'AB',
      archetype: 'builder',
      connectionStyle: 'workshop',
      onboardingLevel: 1,
      interests: [
        { name: 'Woodworking & Carpentry', proficiencyLevel: 2 },
        { name: 'Metalworking & Blacksmithing', proficiencyLevel: 2 }
      ]
    },
    {
      email: 'samuel.demo@example.com',
      displayName: 'Samuel',
      latitude: 51.060,
      longitude: -114.080,
      community: 'Kensington',
      city: 'Calgary',
      region: 'AB',
      archetype: 'guide',
      connectionStyle: 'outpost',
      onboardingLevel: 1,
      interests: [
        { name: 'Hunting & Fishing', proficiencyLevel: 3 }
      ]
    },
    {
      email: 'elijah.demo@example.com',
      displayName: 'Elijah',
      latitude: 51.040,
      longitude: -114.060,
      community: 'Victoria Park',
      city: 'Calgary',
      region: 'AB',
      archetype: 'watchman',
      connectionStyle: 'outpost',
      onboardingLevel: 1,
      interests: [
        { name: 'Cybersecurity', proficiencyLevel: 3 }
      ]
    },
    {
      email: 'nathan.demo@example.com',
      displayName: 'Nathan',
      latitude: 51.052,
      longitude: -114.072,
      community: 'Crescent Heights',
      city: 'Calgary',
      region: 'AB',
      archetype: 'sage',
      connectionStyle: 'fireside',
      onboardingLevel: 1,
      interests: [
        { name: 'Mentorship & Coaching', proficiencyLevel: 3 }
      ]
    },
    {
      email: 'joshua.demo@example.com',
      displayName: 'Joshua',
      latitude: 51.048,
      longitude: -114.068,
      community: 'Downtown West End',
      city: 'Calgary',
      region: 'AB',
      archetype: 'builder',
      connectionStyle: 'workshop',
      onboardingLevel: 1,
      interests: [
        { name: 'Software Development', proficiencyLevel: 3 }
      ]
    },
  ];

  for (const personData of demoPersons) {
    const { interests: personInterests, ...personInfo } = personData;

    // Create person
    const person = await prisma.person.upsert({
      where: { email: personInfo.email },
      update: {},
      create: {
        ...personInfo,
        supabaseUserId: `demo-${personInfo.email}`, // Fake Supabase ID for demo
      }
    });

    // Add interests
    for (const { name: interestName, proficiencyLevel } of personInterests) {
      const interest = await prisma.interest.findUnique({
        where: { name: interestName }
      });

      if (interest) {
        await prisma.personInterest.upsert({
          where: {
            personId_interestId: {
              personId: person.id,
              interestId: interest.id
            }
          },
          update: { proficiencyLevel },
          create: {
            personId: person.id,
            interestId: interest.id,
            proficiencyLevel
          }
        });
      } else {
        console.warn(`⚠️  Interest "${interestName}" not found for ${person.displayName}`);
      }
    }

    console.log(`✅ Created person: ${person.displayName} (${person.community})`);
  }

  console.log('\n🎉 Demo persons seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
