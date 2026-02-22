import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const samplePrayers = [
  {
    content: "Please pray for my family. We're going through a difficult financial season and need God's provision and wisdom.",
    prayerCount: 12,
  },
  {
    content: "Praying for strength as I battle anxiety. Some days are harder than others. Trusting God to give me peace.",
    prayerCount: 8,
  },
  {
    content: "My father is in the hospital recovering from surgery. Please pray for his healing and the doctors treating him.",
    prayerCount: 15,
  },
  {
    content: "Starting a new job next week and feeling nervous. Pray for confidence and that I can be a light in this workplace.",
    prayerCount: 6,
  },
  {
    content: "Struggling with doubt in my faith journey. Pray that God would strengthen my belief and draw me closer to Him.",
    prayerCount: 10,
  },
  {
    content: "Marriage has been tough lately. Please pray for healing, communication, and renewed love between my wife and me.",
    prayerCount: 14,
  },
  {
    content: "Lost my job this week. Trusting God for provision and direction. Pray I find new opportunities soon.",
    prayerCount: 18,
  },
  {
    content: "Battling addiction and need prayer for freedom. Taking it one day at a time with God's help.",
    prayerCount: 9,
  },
  {
    content: "My son is struggling in school. Pray for wisdom as we navigate learning challenges and find the right support.",
    prayerCount: 7,
  },
  {
    content: "Feeling called to ministry but unsure of the next steps. Praying for clear direction and open doors.",
    prayerCount: 5,
  },
];

async function main() {
  console.log('🌱 Seeding prayers...\n');

  // Exclude test users from prayer wall
  const excludeTestUsers = ['Paul Lau', 'Allen Chi', 'Gil Molina', 'Gil Motina'];

  // Find all users with onboardingLevel >= 1, excluding test users
  const users = await prisma.person.findMany({
    where: {
      onboardingLevel: {
        gte: 1,
      },
      displayName: {
        notIn: excludeTestUsers,
      },
    },
    select: {
      id: true,
      displayName: true,
    },
  });

  if (users.length === 0) {
    console.error('❌ No onboarded users found. Please create users first.');
    return;
  }

  console.log(`Found ${users.length} onboarded users (excluding test users)\n`);

  // Create prayers for random users
  for (let i = 0; i < samplePrayers.length; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const prayer = samplePrayers[i];

    const createdPrayer = await prisma.prayerPost.create({
      data: {
        authorId: randomUser.id,
        content: prayer.content,
        prayerCount: prayer.prayerCount,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      },
    });

    // Create random prayer responses
    const numResponses = prayer.prayerCount;
    const respondents = users
      .filter(u => u.id !== randomUser.id) // Don't pray for own prayer
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, Math.min(numResponses, users.length - 1)); // Take up to numResponses users

    for (const respondent of respondents) {
      try {
        await prisma.prayerResponse.create({
          data: {
            prayerPostId: createdPrayer.id,
            prayerId: respondent.id,
            createdAt: new Date(createdPrayer.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
          },
        });
      } catch (e) {
        // Skip if duplicate (unique constraint)
        if (e.code !== 'P2002') throw e;
      }
    }

    console.log(`✅ Created prayer by ${randomUser.displayName} (${numResponses} prayers)`);
  }

  console.log('\n🎉 Prayer seeding complete!\n');
  console.log('Run the app and navigate to /prayers to see them.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding prayers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
