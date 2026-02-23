import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/DashboardClient';
import DiscoveryClient from '@/components/DiscoveryClient';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
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
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">Finishing Setup...</h1>
        <p>Please wait while we set up your profile.</p>
      </div>
    );
  }

  // Map interests for easier use (filter out any with missing interest data)
  const interests = person.interests
    .filter((pi) => pi.interest != null)
    .map((pi) => ({
      ...pi.interest!,
      proficiencyLevel: pi.proficiencyLevel,
    }));

  // Calculate mentor status
  const mentorCount = interests.filter((pi) => pi.proficiencyLevel >= 4).length;
  const isMentor = mentorCount > 0;

  // Extract archetype directly from person
  const archetypeName = person.archetype;

  // Default user location (Calgary, AB) - TODO: Get from person.latitude/longitude
  const userLocation = {
    lat: person.latitude || 51.045,
    lng: person.longitude || -114.065,
  };

  return (
    <DashboardClient
      personId={person.id}
      displayName={person.displayName}
      email={person.email}
      onboardingLevel={person.onboardingLevel}
      isMentor={isMentor}
      archetypeName={archetypeName || ''}
      primaryCraftName={interests[0]?.name}
      station={person.community || undefined}
      city={person.city || undefined}
      region={person.region || undefined}
      connectionStyle={person.connectionStyle || undefined}
      latitude={person.latitude || undefined}
      longitude={person.longitude || undefined}
    >
      <DiscoveryClient
        personId={person.id}
        userLocation={userLocation}
        savedRadius={person.proximityRadiusKm || 5}
        userStation={`${person.city || 'Unknown'}, ${person.region || 'Unknown'}`}
      />
    </DashboardClient>
  );
}
