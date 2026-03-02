import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Use Session pooler for seeding (supports prepared statements)
const pool = new Pool({
  connectionString: process.env.MIGRATION_URL || process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categoriesData = [
  {
    name: 'Outdoor & Adventure',
    slug: 'outdoor_adventure',
    description: 'Activities in nature, exploration, and adventure pursuits',
    order: 1,
    activities: [
      'Hiking', 'Backpacking', 'Scrambling', 'Trekking', 'Trail Running',
      'Camping', 'Bushcraft', 'Survival Skills', 'Mountaineering', 'Alpinism',
      'Orienteering', 'Navigation', 'Hunting', 'Fishing', 'Conservation',
      'Overlanding', 'Off-roading', 'Sailing', 'Canoeing', 'Kayaking',
      'Rafting', 'Scuba Diving', 'Surfing', 'Skiing', 'Snowboarding',
      'Paragliding', 'Caving', 'Horseback Riding', 'Stargazing',
    ],
  },
  {
    name: 'Craftsmanship, Trades & Maker',
    slug: 'craftsmanship_trades_maker',
    description: 'Building, creating, and working with hands and tools',
    order: 2,
    activities: [
      'Woodworking', 'Carpentry', 'Metalworking', 'Blacksmithing',
      'Leatherwork', 'Knife-making', 'Automotive Repair', 'Motorcycle Maintenance',
      'Home Renovation', 'DIY Trades', 'Electronics', 'Robotics',
      'Raspberry Pi', '3D Printing', 'Welding', 'Pottery',
      'Model Building', 'Beekeeping', 'Bonsai', 'Gardening/Homesteading',
    ],
  },
  {
    name: 'Physicality, Combat & Team Sports',
    slug: 'physicality_combat_team_sports',
    description: 'Physical fitness, martial arts, and competitive sports',
    order: 3,
    activities: [
      'Strength Training', 'Functional Fitness', 'Martial Arts', 'Self-Defense',
      'Team Sports', 'Marksmanship', 'Archery', 'Airsoft',
      'Paintball', 'Obstacle Course Racing', 'Triathlon', 'Running',
      'Cycling', 'Motorcycling', 'Parkour', 'Yoga', 'Pilates',
    ],
  },
  {
    name: 'Culinary, Fire & Food Systems',
    slug: 'culinary_fire_food_systems',
    description: 'Cooking, food preparation, and food systems',
    order: 4,
    activities: [
      'BBQ', 'Smoking', 'Grilling', 'Butchery', 'Foraging',
      'Wild Foods', 'Home Brewing', 'Fermentation', 'Distilling',
      'Community Kitchens', 'Food Bank Volunteering', 'Homesteading Food Production',
    ],
  },
  {
    name: 'Strategy, Mentorship & Leadership',
    slug: 'strategy_mentorship_leadership',
    description: 'Mental challenges, coaching, and leadership development',
    order: 5,
    activities: [
      'Chess', 'Strategy Games', 'Board Games', 'Mentorship',
      'Coaching', 'Leadership Development', 'Communication & Public Speaking',
      'Entrepreneurship', 'Small Business Mentoring', 'Project-Based Service Leadership',
      'Language Learning', 'Financial Stewardship',
    ],
  },
  {
    name: 'Faith, Formation & Relational Care',
    slug: 'faith_formation_relational_care',
    description: 'Spiritual practices, ministry, and pastoral care',
    order: 6,
    activities: [
      'Bible Study', 'Prayer Groups', 'Spiritual Retreats', 'Liturgical Rhythms',
      'Fathering Groups', 'Parenting Classes', 'Marriage Ministry',
      'Young Adult Ministry', 'Youth Ministry', "Children's Ministry",
      'Campus Ministry', 'Addiction Recovery', 'Grief Support',
      'Pastoral Care', 'Mental Health Peer Support', 'Testimony Nights',
      'Online Evangelism',
    ],
  },
  {
    name: 'Service, Civic & Community Action',
    slug: 'service_civic_community_action',
    description: 'Community service, outreach, and social justice',
    order: 7,
    activities: [
      'Disaster Relief', 'Habitat Builds', 'Community Outreach',
      'Homeless Ministry', 'Anti-Poverty Initiatives', 'Anti-Human Trafficking',
      'Pro-Life Ministry', 'Prison Ministry', 'Veterans Support',
      'Medical Missions', 'Local Evangelism', 'Civic Engagement',
    ],
  },
  {
    name: 'Creative & Cultural',
    slug: 'creative_cultural',
    description: 'Arts, music, storytelling, and creative expression',
    order: 8,
    activities: [
      'Music', 'Worship Teams', 'Songwriting', 'Photography',
      'Film', 'Videography', 'Storytelling', 'Writing',
      'Theater/Drama', 'Comedy/Improv', 'Craft Circles', 'Instrument Building',
      'Painting', 'Drawing', 'Digital Art',
    ],
  },
];

async function seedCategories() {
  console.log('🌱 Starting to seed interest categories and activities...');

  for (const categoryData of categoriesData) {
    const { activities, ...categoryInfo } = categoryData;

    console.log(`\n📂 Creating category: ${categoryInfo.name}`);

    // Upsert category with activities
    const category = await prisma.interestCategory.upsert({
      where: { slug: categoryInfo.slug },
      update: {
        ...categoryInfo,
      },
      create: {
        ...categoryInfo,
        activities: {
          create: activities.map((activityName) => ({
            name: activityName,
          })),
        },
      },
      include: {
        activities: true,
      },
    });

    // If updating, add new activities that don't exist
    if (category.activities.length < activities.length) {
      const existingActivityNames = category.activities.map((a) => a.name);
      const newActivities = activities.filter(
        (name) => !existingActivityNames.includes(name)
      );

      if (newActivities.length > 0) {
        await prisma.activity.createMany({
          data: newActivities.map((name) => ({
            name,
            categoryId: category.id,
          })),
          skipDuplicates: true,
        });
        console.log(`   ➕ Added ${newActivities.length} new activities`);
      }
    }

    const finalCount = await prisma.activity.count({
      where: { categoryId: category.id },
    });
    console.log(`   ✅ ${category.name}: ${finalCount} activities`);
  }

  // Count total
  const totalCategories = await prisma.interestCategory.count();
  const totalActivities = await prisma.activity.count();

  console.log('\n✨ Categories seed complete!');
  console.log(`📊 Total categories: ${totalCategories}`);
  console.log(`📊 Total activities: ${totalActivities}`);
}

async function main() {
  try {
    console.log('🚀 Brotherhood Connect - Database Seed\n');

    // Check existing data
    const existingPersons = await prisma.person.count();
    const existingCategories = await prisma.interestCategory.count();

    console.log('📊 Current database state:');
    console.log(`   - Persons: ${existingPersons}`);
    console.log(`   - Interest Categories: ${existingCategories}`);

    // Seed categories and activities
    await seedCategories();

    console.log('\n✅ All seeding complete!');
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
