import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoriesData = [
  {
    name: 'Outdoor & Adventure',
    slug: 'outdoor_adventure',
    description: 'Activities in nature, exploration, and adventure pursuits',
    order: 1,
    activities: [
      'Hiking',
      'Backpacking',
      'Scrambling',
      'Trekking',
      'Trail Running',
      'Camping',
      'Bushcraft',
      'Survival Skills',
      'Mountaineering',
      'Alpinism',
      'Orienteering',
      'Navigation',
      'Hunting',
      'Fishing',
      'Conservation',
      'Overlanding',
      'Off-roading',
      'Sailing',
      'Canoeing',
      'Kayaking',
      'Rafting',
      'Scuba Diving',
      'Surfing',
      'Skiing',
      'Snowboarding',
      'Paragliding',
      'Caving',
      'Horseback Riding',
      'Stargazing',
    ],
  },
  {
    name: 'Craftsmanship, Trades & Maker',
    slug: 'craftsmanship_trades_maker',
    description: 'Building, creating, and working with hands and tools',
    order: 2,
    activities: [
      'Woodworking',
      'Carpentry',
      'Metalworking',
      'Blacksmithing',
      'Leatherwork',
      'Knife-making',
      'Automotive Repair',
      'Motorcycle Maintenance',
      'Home Renovation',
      'DIY Trades',
      'Electronics',
      'Robotics',
      'Raspberry Pi',
      '3D Printing',
      'Welding',
      'Pottery',
      'Model Building',
      'Beekeeping',
      'Bonsai',
      'Gardening/Homesteading',
    ],
  },
  {
    name: 'Physicality, Combat & Team Sports',
    slug: 'physicality_combat_team_sports',
    description: 'Physical fitness, martial arts, and competitive sports',
    order: 3,
    activities: [
      'Strength Training',
      'Functional Fitness',
      'Martial Arts',
      'Self-Defense',
      'Team Sports',
      'Marksmanship',
      'Archery',
      'Airsoft',
      'Paintball',
      'Obstacle Course Racing',
      'Triathlon',
      'Running',
      'Cycling',
      'Motorcycling',
      'Parkour',
      'Yoga',
      'Pilates',
    ],
  },
  {
    name: 'Culinary, Fire & Food Systems',
    slug: 'culinary_fire_food_systems',
    description: 'Cooking, food preparation, and food systems',
    order: 4,
    activities: [
      'BBQ',
      'Smoking',
      'Grilling',
      'Butchery',
      'Foraging',
      'Wild Foods',
      'Home Brewing',
      'Fermentation',
      'Distilling',
      'Community Kitchens',
      'Food Bank Volunteering',
      'Homesteading Food Production',
    ],
  },
  {
    name: 'Strategy, Mentorship & Leadership',
    slug: 'strategy_mentorship_leadership',
    description: 'Mental challenges, coaching, and leadership development',
    order: 5,
    activities: [
      'Chess',
      'Strategy Games',
      'Board Games',
      'Mentorship',
      'Coaching',
      'Leadership Development',
      'Communication & Public Speaking',
      'Entrepreneurship',
      'Small Business Mentoring',
      'Project-Based Service Leadership',
      'Language Learning',
      'Financial Stewardship',
    ],
  },
  {
    name: 'Faith, Formation & Relational Care',
    slug: 'faith_formation_relational_care',
    description: 'Spiritual practices, ministry, and pastoral care',
    order: 6,
    activities: [
      'Bible Study',
      'Prayer Groups',
      'Spiritual Retreats',
      'Liturgical Rhythms',
      'Fathering Groups',
      'Parenting Classes',
      'Marriage Ministry',
      'Young Adult Ministry',
      'Youth Ministry',
      "Children's Ministry",
      'Campus Ministry',
      'Addiction Recovery',
      'Grief Support',
      'Pastoral Care',
      'Mental Health Peer Support',
      'Testimony Nights',
      'Online Evangelism',
    ],
  },
  {
    name: 'Service, Civic & Community Action',
    slug: 'service_civic_community_action',
    description: 'Community service, outreach, and social justice',
    order: 7,
    activities: [
      'Disaster Relief',
      'Habitat Builds',
      'Community Outreach',
      'Homeless Ministry',
      'Anti-Poverty Initiatives',
      'Anti-Human Trafficking',
      'Pro-Life Ministry',
      'Prison Ministry',
      'Veterans Support',
      'Medical Missions',
      'Local Evangelism',
      'Civic Engagement',
    ],
  },
  {
    name: 'Creative & Cultural',
    slug: 'creative_cultural',
    description: 'Arts, music, storytelling, and creative expression',
    order: 8,
    activities: [
      'Music',
      'Worship Teams',
      'Songwriting',
      'Photography',
      'Film',
      'Videography',
      'Storytelling',
      'Writing',
      'Theater/Drama',
      'Comedy/Improv',
      'Craft Circles',
      'Instrument Building',
      'Painting',
      'Drawing',
      'Digital Art',
    ],
  },
];

async function seedCategories() {
  console.log('🌱 Starting to seed interest categories and activities...');

  for (const categoryData of categoriesData) {
    const { activities, ...categoryInfo } = categoryData;

    console.log(`\n📂 Creating category: ${categoryInfo.name}`);

    // Create category with activities
    const category = await prisma.interestCategory.create({
      data: {
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

    console.log(
      `   ✅ Created ${category.activities.length} activities for ${category.name}`
    );
  }

  // Count total
  const totalCategories = await prisma.interestCategory.count();
  const totalActivities = await prisma.activity.count();

  console.log('\n✨ Seed complete!');
  console.log(`📊 Total categories: ${totalCategories}`);
  console.log(`📊 Total activities: ${totalActivities}`);
}

async function main() {
  try {
    await seedCategories();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
