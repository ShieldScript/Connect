import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { PrayersClient } from '@/components/PrayersClient';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function PrayersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const person = await prisma.person.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      interests: {
        include: {
          interest: true,
        },
      },
    },
  });

  if (!person) {
    redirect('/onboarding');
  }

  if (person.onboardingLevel < 1) {
    redirect('/onboarding');
  }

  // Map interests for mentor status
  const interests = person.interests.map(pi => ({
    ...pi.interest,
    proficiencyLevel: pi.proficiencyLevel,
  }));

  const mentorCount = interests.filter(pi => pi.proficiencyLevel >= 4).length;
  const isMentor = mentorCount > 0;
  const archetypeName = person.archetype;

  return (
    <DashboardClient
      personId={person.id}
      displayName={person.displayName}
      email={person.email}
      onboardingLevel={person.onboardingLevel}
      isMentor={isMentor}
      archetypeName={archetypeName || ''}
      primaryCraftName={interests[0]?.name}
    >
      <PrayersClient
        personId={person.id}
        personName={person.displayName}
      />
    </DashboardClient>
  );
}
