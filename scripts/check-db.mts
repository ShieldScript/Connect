import { prisma } from '../src/lib/prisma';

async function checkDatabase() {
  try {
    const [personCount, interestCount, groupCount, membershipCount] = await Promise.all([
      prisma.person.count(),
      prisma.interest.count(),
      prisma.group.count(),
      prisma.groupMembership.count(),
    ]);

    console.log('✅ Database Connection Successful');
    console.log('\n📊 Database Statistics:');
    console.log(`   - Persons: ${personCount}`);
    console.log(`   - Interests: ${interestCount}`);
    console.log(`   - Groups: ${groupCount}`);
    console.log(`   - Memberships: ${membershipCount}`);

    if (personCount === 0) {
      console.log('\n⚠️  No seed data found. Run: npx prisma db seed');
    } else {
      console.log('\n✅ Seed data present');
    }
  } catch (error) {
    console.error('❌ Database Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
