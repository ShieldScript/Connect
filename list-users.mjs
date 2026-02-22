import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const persons = await prisma.person.findMany({
  select: {
    displayName: true,
    email: true,
    onboardingLevel: true,
    createdAt: true
  },
  orderBy: { createdAt: 'desc' }
});

console.log(`\nTotal users: ${persons.length}\n`);
persons.forEach((p, i) => {
  console.log(`${i + 1}. ${p.displayName} (${p.email})`);
  console.log(`   Onboarding Level: ${p.onboardingLevel}`);
  console.log(`   Created: ${p.createdAt.toLocaleDateString()}\n`);
});

await prisma.$disconnect();
