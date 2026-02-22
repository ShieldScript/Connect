const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding interests...')

  const interests = [
    { name: 'Hiking', category: 'HOBBY' },
    { name: 'Mountain Biking', category: 'HOBBY' },
    { name: 'Coffee', category: 'SOCIAL' },
    { name: 'Board Games', category: 'HOBBY' },
    { name: 'Tech', category: 'PROFESSIONAL' },
    { name: 'Theology', category: 'SPIRITUAL' },
    { name: "Men's Support", category: 'SUPPORT' },
    { name: 'Volunteering', category: 'SOCIAL' },
    { name: 'Fitness', category: 'HOBBY' },
    { name: 'Reading', category: 'HOBBY' },
  ]

  for (const interest of interests) {
    try {
      await prisma.interest.upsert({
        where: { name: interest.name },
        update: {},
        create: {
          name: interest.name,
          category: interest.category,
        },
      })
    } catch (e) {
      console.warn(`Could not seed interest ${interest.name}:`, e.message)
    }
  }

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
