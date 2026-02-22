import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Comprehensive seed script that:
 * 1. Adds interests to ALL users (including real users: Allen, Paul, Gil)
 * 2. Creates groups and adds all users as members
 * 3. Sets PostGIS location fields properly
 */

async function seedAllUsers() {
  try {
    console.log('🌱 Starting comprehensive seed for all users...\n');

    // ====== 1. FIND ALL PERSONS ======
    const allPersons = await prisma.person.findMany({
      include: {
        interests: {
          include: {
            interest: true
          }
        }
      }
    });

    console.log(`📊 Found ${allPersons.length} total persons in database\n`);

    // ====== 2. GET ALL INTERESTS ======
    const allInterests = await prisma.interest.findMany();
    console.log(`📚 Found ${allInterests.length} interests\n`);

    if (allInterests.length === 0) {
      console.log('⚠️  No interests found. Please run seed.ts first to create interests.');
      return;
    }

    // ====== 3. ADD INTERESTS TO USERS WHO HAVE NONE ======
    console.log('🎯 Adding interests to users...\n');

    const interestsByCategory = allInterests.reduce((acc, interest) => {
      if (!acc[interest.category]) {
        acc[interest.category] = [];
      }
      acc[interest.category].push(interest);
      return acc;
    }, {} as Record<string, typeof allInterests>);

    // Define interests for real users
    const userInterestProfiles: Record<string, { categories: string[], proficiencyLevels: number[] }> = {
      'allen.chi@servingtheking.com': {
        categories: ['digital_tech', 'strategy_mentorship_leadership', 'creative_cultural'],
        proficiencyLevels: [5, 4, 3] // Expert, Intermediate, Intermediate
      },
      'paul.lau@servingtheking.com': {
        categories: ['faith_formation_relational', 'service_civic_community', 'strategy_mentorship_leadership'],
        proficiencyLevels: [5, 4, 3]
      },
      'gil.molina@servingtheking.com': {
        categories: ['digital_tech', 'strategy_mentorship_leadership', 'outdoor_adventure'],
        proficiencyLevels: [5, 4, 3]
      }
    };

    for (const person of allPersons) {
      // Skip if person already has interests
      if (person.interests.length > 0) {
        console.log(`   ✅ ${person.displayName} already has ${person.interests.length} interests`);
        continue;
      }

      // Get interest profile for this person
      const profile = userInterestProfiles[person.email];

      if (profile) {
        // Real user - assign specific interests
        console.log(`   🎯 Adding interests for ${person.displayName}...`);

        const interestsToAdd: { interestId: string, proficiencyLevel: number }[] = [];

        profile.categories.forEach((category, index) => {
          const categoryInterests = interestsByCategory[category] || [];
          if (categoryInterests.length > 0) {
            // Pick 2-3 interests from this category
            const count = Math.min(2 + Math.floor(Math.random() * 2), categoryInterests.length);
            const selected = categoryInterests
              .sort(() => 0.5 - Math.random())
              .slice(0, count);

            selected.forEach(interest => {
              interestsToAdd.push({
                interestId: interest.id,
                proficiencyLevel: profile.proficiencyLevels[index] || 3
              });
            });
          }
        });

        // Create person interests
        await prisma.personInterest.createMany({
          data: interestsToAdd.map(({ interestId, proficiencyLevel }) => ({
            personId: person.id,
            interestId,
            proficiencyLevel
          }))
        });

        console.log(`      ✨ Added ${interestsToAdd.length} interests`);
      }
    }

    // ====== 4. UPDATE POSTGIS LOCATION FIELDS ======
    console.log('\n📍 Updating PostGIS location fields...\n');

    const personLocationUpdate = await prisma.$executeRaw`
      UPDATE "Person"
      SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
    `;
    console.log(`   ✅ Updated ${personLocationUpdate} person locations`);

    const groupLocationUpdate = await prisma.$executeRaw`
      UPDATE "Group"
      SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
    `;
    console.log(`   ✅ Updated ${groupLocationUpdate} group locations`);

    // ====== 5. ADD USERS TO GROUPS ======
    console.log('\n👥 Adding users to groups...\n');

    const groups = await prisma.group.findMany({
      include: {
        memberships: true
      }
    });

    for (const group of groups) {
      // Find users who are not yet members
      const existingMemberIds = group.memberships.map(m => m.personId);
      const nonMembers = allPersons.filter(p => !existingMemberIds.includes(p.id) && p.id !== group.createdBy);

      // Add 1-3 random non-members to each group
      const count = Math.min(1 + Math.floor(Math.random() * 3), nonMembers.length);
      const newMembers = nonMembers.sort(() => 0.5 - Math.random()).slice(0, count);

      for (const member of newMembers) {
        await prisma.groupMembership.create({
          data: {
            groupId: group.id,
            personId: member.id,
            role: 'MEMBER',
            status: 'ACTIVE',
            joinedAt: new Date()
          }
        });
        console.log(`   ✅ Added ${member.displayName} to ${group.name}`);
      }

      // Update group size
      const totalMembers = existingMemberIds.length + newMembers.length;
      await prisma.group.update({
        where: { id: group.id },
        data: { currentSize: totalMembers }
      });
    }

    // ====== 6. FINAL SUMMARY ======
    console.log('\n' + '='.repeat(60));
    console.log('✨ Comprehensive Seed Complete!');
    console.log('='.repeat(60));

    const finalPersons = await prisma.person.findMany({
      include: {
        interests: true,
        memberships: {
          include: {
            group: true
          }
        }
      }
    });

    console.log('\n📊 Final User Summary:');
    finalPersons.forEach(p => {
      const activeGroups = p.memberships.filter(m => m.status === 'ACTIVE').length;
      console.log(`   - ${p.displayName}: ${p.interests.length} interests, ${activeGroups} groups`);
    });

    console.log('\n✅ All users now have interests and group memberships!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedAllUsers();
