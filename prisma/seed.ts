import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { interests } from './interests-seed-data';

// Use Session pooler for seeding (supports prepared statements)
const pool = new Pool({ connectionString: process.env.MIGRATION_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed database with comprehensive Interest data
 * Imports from interests-seed-data.ts
 */

async function main() {
  console.log('🌱 Starting database seed...');

  // ====== 0. CHECK EXISTING DATA ======
  const existingPersons = await prisma.person.count();
  const existingInterests = await prisma.interest.count();
  const existingGroups = await prisma.group.count();

  console.log('\n📊 Current database state:');
  console.log(`   - Persons: ${existingPersons}`);
  console.log(`   - Interests: ${existingInterests}`);
  console.log(`   - Groups: ${existingGroups}`);

  if (existingPersons > 0) {
    const persons = await prisma.person.findMany({ take: 5, select: { displayName: true, email: true } });
    console.log('\n   Existing persons:');
    persons.forEach(p => console.log(`     - ${p.displayName} (${p.email})`));
  }

  // ====== 1. CREATE INTERESTS ======
  console.log('\n📚 Creating interests...');
  const createdInterests = [];
  for (const interest of interests) {
    const created = await prisma.interest.upsert({
      where: { name: interest.name },
      update: {
        category: interest.category,
        description: interest.description,
        popularity: interest.popularity,
        metadata: interest.metadata || null,
      },
      create: {
        name: interest.name,
        category: interest.category,
        description: interest.description,
        popularity: interest.popularity,
        metadata: interest.metadata || null,
      },
    });
    createdInterests.push(created);
  }

  console.log(`✅ Created ${interests.length} interests across ${[...new Set(interests.map(i => i.category))].length} categories`);

  // ====== 2. CREATE TEST USERS ======
  console.log('\n👥 Creating test users...');

  const testUsers = [
    {
      supabaseUserId: 'test-user-1',
      email: 'john.warrior@test.com',
      displayName: 'John Martinez',
      bio: 'Leadership comes naturally. I love strategy games and mentoring others.',
      archetype: 'Warrior',
      connectionStyle: 'builders',
      community: 'Mission',
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0367,
      longitude: -114.0819,
      onboardingLevel: 1,
      ageRange: '30-39',
      isPotentialShepherd: true,
    },
    {
      supabaseUserId: 'test-user-2',
      email: 'mike.sage@test.com',
      displayName: 'Mike Johnson',
      bio: 'Always seeking wisdom through books and deep conversations.',
      archetype: 'Sage',
      connectionStyle: 'fireside',
      community: 'Kensington',
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0533,
      longitude: -114.0869,
      onboardingLevel: 1,
      ageRange: '40-49',
    },
    {
      supabaseUserId: 'test-user-3',
      email: 'david.lover@test.com',
      displayName: 'David Chen',
      bio: 'Building connections and fostering community wherever I go.',
      archetype: 'Lover',
      connectionStyle: 'fireside',
      community: 'Beltline',
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0408,
      longitude: -114.0719,
      onboardingLevel: 1,
      ageRange: '25-29',
    },
    {
      supabaseUserId: 'test-user-4',
      email: 'james.magician@test.com',
      displayName: 'James Thompson',
      bio: 'Creative problem solver who loves innovation and technology.',
      archetype: 'Magician',
      connectionStyle: 'builders',
      community: 'Downtown',
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0447,
      longitude: -114.0719,
      onboardingLevel: 1,
      ageRange: '30-39',
    },
    {
      supabaseUserId: 'test-user-5',
      email: 'robert.explorer@test.com',
      displayName: 'Robert Kim',
      bio: 'Adventure seeker, always ready for the next challenge.',
      archetype: 'Explorer',
      connectionStyle: 'builders',
      community: 'Inglewood',
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0408,
      longitude: -114.0519,
      onboardingLevel: 1,
      ageRange: '35-44',
    },
    {
      supabaseUserId: 'test-user-6',
      email: 'chris.jester@test.com',
      displayName: 'Chris Anderson',
      bio: 'Life is too short not to laugh. Bringing joy wherever I go.',
      archetype: 'Jester',
      connectionStyle: 'fireside',
      community: 'Bridgeland',
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0564,
      longitude: -114.0619,
      onboardingLevel: 1,
      ageRange: '28-34',
    },
    {
      supabaseUserId: 'test-user-7',
      email: 'paul.caregiver@test.com',
      displayName: 'Paul Rodriguez',
      bio: 'Serving others is my calling. Always ready to help.',
      archetype: 'Caregiver',
      connectionStyle: 'fireside',
      community: 'Hillhurst',
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0608,
      longitude: -114.0969,
      onboardingLevel: 1,
      ageRange: '45-54',
      isPotentialShepherd: true,
    },
    {
      supabaseUserId: 'test-user-8',
      email: 'mark.ruler@test.com',
      displayName: 'Mark Wilson',
      bio: 'Organization and structure bring peace. Let me help coordinate.',
      archetype: 'Ruler',
      connectionStyle: 'builders',
      community: 'Ramsay',
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0331,
      longitude: -114.0519,
      onboardingLevel: 1,
      ageRange: '50-59',
    },
    // Additional users in SAME LOCATIONS to demonstrate clustering
    {
      supabaseUserId: 'test-user-9',
      email: 'tom.builder@test.com',
      displayName: 'Tom Davis',
      bio: 'Craftsman at heart, building things with my hands.',
      archetype: 'Builder',
      connectionStyle: 'builders',
      community: 'Mission', // SAME as test-user-1
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0367,  // SAME coordinates
      longitude: -114.0819,
      onboardingLevel: 1,
      ageRange: '32-38',
    },
    {
      supabaseUserId: 'test-user-10',
      email: 'steve.navigator@test.com',
      displayName: 'Steve Brown',
      bio: 'Finding the path forward, one step at a time.',
      archetype: 'Navigator',
      connectionStyle: 'fireside',
      community: 'Mission', // SAME as test-user-1 and test-user-9
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0367,  // SAME coordinates
      longitude: -114.0819,
      onboardingLevel: 1,
      ageRange: '29-35',
    },
    {
      supabaseUserId: 'test-user-11',
      email: 'alex.sage@test.com',
      displayName: 'Alex Turner',
      bio: 'Deep thinker, always pondering life\'s big questions.',
      archetype: 'Sage',
      connectionStyle: 'fireside',
      community: 'Kensington', // SAME as test-user-2
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0533,  // SAME coordinates
      longitude: -114.0869,
      onboardingLevel: 1,
      ageRange: '38-45',
    },
    {
      supabaseUserId: 'test-user-12',
      email: 'brian.provider@test.com',
      displayName: 'Brian Lee',
      bio: 'Hospitality and nourishment - that\'s what I bring.',
      archetype: 'Provider',
      connectionStyle: 'builders',
      community: 'Kensington', // SAME as test-user-2 and test-user-11
      city: 'Calgary',
      region: 'Alberta',
      latitude: 51.0533,  // SAME coordinates
      longitude: -114.0869,
      onboardingLevel: 1,
      ageRange: '41-47',
    },
  ];

  const createdPersons = [];
  const personIdsToUpdateLocation: string[] = [];
  for (const userData of testUsers) {
    const person = await prisma.person.upsert({
      where: { supabaseUserId: userData.supabaseUserId },
      update: userData,
      create: userData,
    });
    createdPersons.push(person);
    if (userData.latitude && userData.longitude) {
      personIdsToUpdateLocation.push(person.id);
    }
  }

  // Update PostGIS location field for all persons with lat/lng
  if (personIdsToUpdateLocation.length > 0) {
    await prisma.$executeRaw`
      UPDATE "Person"
      SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
      WHERE id = ANY(${personIdsToUpdateLocation}::text[])
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
    `;
    console.log(`📍 Updated PostGIS location for ${personIdsToUpdateLocation.length} persons`);
  }

  console.log(`✅ Upserted ${createdPersons.length} test users (created or updated existing)`);

  // ====== 3. CREATE PERSON-INTERESTS ======
  console.log('\n🎯 Linking users to interests...');

  // Helper to get random interests
  const getRandomInterests = (count: number) => {
    const shuffled = [...createdInterests].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  let totalPersonInterests = 0;
  for (const person of createdPersons) {
    // Delete existing interests for this person to avoid conflicts
    await prisma.personInterest.deleteMany({
      where: { personId: person.id },
    });

    const personInterests = getRandomInterests(5 + Math.floor(Math.random() * 5)); // 5-10 interests per person

    for (const interest of personInterests) {
      await prisma.personInterest.create({
        data: {
          personId: person.id,
          interestId: interest.id,
          proficiencyLevel: Math.floor(Math.random() * 3) + 1, // 1-3 (Learner, Practitioner, Mentor)
        },
      });
      totalPersonInterests++;
    }
  }

  console.log(`✅ Created ${totalPersonInterests} person-interest connections`);

  // ====== 4. CREATE GROUPS ======
  console.log('\n🔥 Creating test groups...');

  // Delete existing groups created by test users to avoid duplicates
  const testCreatorIds = createdPersons.map(p => p.id);
  await prisma.group.deleteMany({
    where: {
      createdBy: { in: testCreatorIds }
    }
  });
  console.log('🗑️  Deleted existing test groups to avoid duplicates');

  const groupData = [
    {
      name: 'Warriors Unite',
      description: 'A gathering for men who lead and protect',
      type: 'SUPPORT',
      status: 'ACTIVE',
      isVirtual: false,
      locationName: 'Mission Community Center',
      latitude: 51.0367,
      longitude: -114.0819,
      maxSize: 12,
      createdBy: createdPersons[0].id, // John the Warrior
    },
    {
      name: 'Wisdom Seekers',
      description: 'Deep discussions on philosophy, theology, and life',
      type: 'SPIRITUAL',
      status: 'ACTIVE',
      isVirtual: true,
      maxSize: 8,
      createdBy: createdPersons[1].id, // Mike the Sage
    },
    {
      name: 'Brotherhood Basketball',
      description: 'Weekly pickup games and fellowship',
      type: 'HOBBY',
      status: 'ACTIVE',
      isVirtual: false,
      locationName: 'Beltline Recreation Center',
      latitude: 51.0408,
      longitude: -114.0719,
      maxSize: 10,
      createdBy: createdPersons[2].id, // David the Lover
    },
    {
      name: 'Tech & Faith',
      description: 'Exploring innovation at the intersection of technology and spirituality',
      type: 'PROFESSIONAL',
      status: 'ACTIVE',
      isVirtual: true,
      maxSize: 15,
      createdBy: createdPersons[3].id, // James the Magician
    },
    {
      name: 'Adventure Brothers',
      description: 'Monthly hiking and outdoor adventures',
      type: 'HOBBY',
      status: 'ACTIVE',
      isVirtual: false,
      locationName: 'Inglewood Trailhead',
      latitude: 51.0408,
      longitude: -114.0519,
      maxSize: 8,
      createdBy: createdPersons[4].id, // Robert the Explorer
    },
    {
      name: 'Fathers Forum',
      description: 'Support group for dads navigating fatherhood',
      type: 'SUPPORT',
      status: 'ACTIVE',
      isVirtual: false,
      locationName: 'Hillhurst Community Hall',
      latitude: 51.0608,
      longitude: -114.0969,
      maxSize: 12,
      createdBy: createdPersons[6].id, // Paul the Caregiver
    },
    // Additional circles in SAME LOCATIONS to demonstrate clustering
    {
      name: 'Mission Coffee & Prayer',
      description: 'Weekly morning gathering for coffee and prayer',
      type: 'SPIRITUAL',
      status: 'ACTIVE',
      isVirtual: false,
      locationName: 'Mission Cafe',
      latitude: 51.0367,  // SAME as Mission (test-user-1, 9, 10)
      longitude: -114.0819,
      maxSize: 8,
      createdBy: createdPersons[8].id, // Tom the Builder (also in Mission)
    },
    {
      name: 'Mission Makers Guild',
      description: 'Woodworking and craftsmanship circle',
      type: 'HOBBY',
      status: 'ACTIVE',
      isVirtual: false,
      locationName: 'Mission Workshop',
      latitude: 51.0367,  // SAME as Mission
      longitude: -114.0819,
      maxSize: 10,
      createdBy: createdPersons[9].id, // Steve the Navigator (also in Mission)
    },
    {
      name: 'Kensington Book Club',
      description: 'Monthly discussion of spiritual and philosophical books',
      type: 'SPIRITUAL',
      status: 'ACTIVE',
      isVirtual: false,
      locationName: 'Kensington Library',
      latitude: 51.0533,  // SAME as Kensington (test-user-2, 11, 12)
      longitude: -114.0869,
      maxSize: 12,
      createdBy: createdPersons[10].id, // Alex the Sage (also in Kensington)
    },
  ];

  const createdGroups = [];
  const groupIdsToUpdateLocation: string[] = [];
  for (const group of groupData) {
    const created = await prisma.group.create({
      data: group,
    });
    createdGroups.push(created);
    if (group.latitude && group.longitude) {
      groupIdsToUpdateLocation.push(created.id);
    }
  }

  // Update PostGIS location field for all groups with lat/lng
  if (groupIdsToUpdateLocation.length > 0) {
    await prisma.$executeRaw`
      UPDATE "Group"
      SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
      WHERE id = ANY(${groupIdsToUpdateLocation}::text[])
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
    `;
    console.log(`📍 Updated PostGIS location for ${groupIdsToUpdateLocation.length} groups`);
  }

  console.log(`✅ Created ${createdGroups.length} groups`);

  // ====== 5. CREATE GROUP MEMBERSHIPS ======
  console.log('\n👨‍👦‍👦 Adding members to groups...');

  let totalMemberships = 0;

  // Add creator as leader for each group
  for (const group of createdGroups) {
    await prisma.groupMembership.create({
      data: {
        groupId: group.id,
        personId: group.createdBy,
        role: 'LEADER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
    });
    totalMemberships++;

    // Add 2-5 random members to each group
    const memberCount = Math.floor(Math.random() * 4) + 2;
    const availableMembers = createdPersons.filter(p => p.id !== group.createdBy);
    const selectedMembers = availableMembers.sort(() => 0.5 - Math.random()).slice(0, memberCount);

    for (const member of selectedMembers) {
      await prisma.groupMembership.create({
        data: {
          groupId: group.id,
          personId: member.id,
          role: 'MEMBER',
          status: 'ACTIVE',
          joinedAt: new Date(),
        },
      });
      totalMemberships++;
    }

    // Update group current size
    await prisma.group.update({
      where: { id: group.id },
      data: { currentSize: 1 + selectedMembers.length },
    });
  }

  console.log(`✅ Created ${totalMemberships} group memberships`);

  // ====== 6. CREATE COMPATIBILITY SCORES ======
  console.log('\n🎯 Calculating compatibility scores...');

  // Delete existing compatibility scores for all test users
  const testUserIds = createdPersons.map(p => p.id);
  await prisma.compatibilityScore.deleteMany({
    where: {
      OR: [
        { personId: { in: testUserIds } },
        { matchedPersonId: { in: testUserIds } },
      ]
    }
  });

  let compatibilityCount = 0;
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Expires in 7 days

  // Create compatibility scores between nearby users
  for (let i = 0; i < createdPersons.length; i++) {
    for (let j = i + 1; j < createdPersons.length; j++) {
      const person1 = createdPersons[i];
      const person2 = createdPersons[j];

      // Calculate simple scores (in real app, use actual matching algorithm)
      const interestSimilarity = Math.random() * 0.5 + 0.3; // 0.3-0.8
      const proximityScore = Math.random() * 0.5 + 0.2; // 0.2-0.7
      const overallScore = (interestSimilarity + proximityScore) / 2;

      const matchReasons = [];
      if (interestSimilarity > 0.6) matchReasons.push('Shared interests');
      if (proximityScore > 0.5) matchReasons.push('Lives nearby');
      if (person1.archetype && person2.archetype && person1.archetype !== person2.archetype) {
        matchReasons.push('Complementary archetypes');
      }

      await prisma.compatibilityScore.create({
        data: {
          personId: person1.id,
          matchedPersonId: person2.id,
          interestSimilarity,
          proximityScore,
          overallScore,
          matchReasons,
          expiresAt: expiryDate,
        },
      });
      compatibilityCount++;
    }
  }

  console.log(`✅ Created ${compatibilityCount} compatibility scores`);

  // ====== SUMMARY ======
  console.log('\n' + '='.repeat(50));
  console.log('✨ Seed completed successfully!');
  console.log('='.repeat(50));
  console.log(`📚 Interests: ${createdInterests.length}`);
  console.log(`👥 Test Users: ${createdPersons.length}`);
  console.log(`🎯 Person-Interests: ${totalPersonInterests}`);
  console.log(`🔥 Groups: ${createdGroups.length}`);
  console.log(`👨‍👦‍👦 Memberships: ${totalMemberships}`);
  console.log(`🎯 Compatibility Scores: ${compatibilityCount}`);
  console.log('='.repeat(50));
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
