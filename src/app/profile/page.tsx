import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/DashboardClient'
import { ProfileClient } from '@/components/ProfileClient'
import type { PersonWithRelations } from '@/types'

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
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
    // Include HEXACO insights for AI features
    select: {
      id: true,
      supabaseUserId: true,
      email: true,
      displayName: true,
      bio: true,
      profileImageUrl: true,
      latitude: true,
      longitude: true,
      community: true,
      city: true,
      region: true,
      proximityRadiusKm: true,
      locationPrivacy: true,
      onboardingStep: true,
      onboardingComplete: true,
      hexacoResponses: true,
      hexacoScores: true,
      hexacoArchetype: true,
      hexacoCompletedAt: true,
      hexacoInsights: true,
      hexacoInsightsGeneratedAt: true,
      covenantAgreedAt: true,
      covenantData: true,
      blockedPersons: true,
      safetyFlags: true,
      lastActiveAt: true,
      createdAt: true,
      updatedAt: true,
      interests: {
        include: {
          interest: true,
        },
      },
      naturalGiftings: true,
      supernaturalGiftings: true,
      ministryExperiences: true,
      milestones: true,
      growthAreas: true,
      leadershipPatterns: true,
      lifeStages: true,
      callings: true,
      healingThemes: true,
      practices: true,
      boundaries: true,
      createdGroups: true,
      memberships: true,
      safetyReportsCreated: true,
      safetyReportsReceived: true,
      compatibilityScores: true,
      huddleMessages: true,
      prayerPosts: true,
      prayerResponses: true,
      notifications: true,
    },
  })

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold">Finishing Setup...</h1>
        <p>Please wait while we set up your profile.</p>
      </div>
    )
  }

  // Map interests for easier use
  const interests = person.interests.filter(pi => pi.interest != null).map(pi => ({
    ...pi.interest!,
    proficiencyLevel: pi.proficiencyLevel,
  }))

  // Calculate mentor status
  const mentorCount = interests.filter(pi => pi.proficiencyLevel >= 4).length
  const isMentor = mentorCount > 0

  // Extract archetype directly from person
  const archetypeName = person.archetype

  // Extract location data
  const station = person.community || 'Your Community'
  const city = person.city || 'Your City'
  const region = person.region || 'Your Region'

  return (
    <DashboardClient
      personId={person.id}
      displayName={person.displayName}
      email={person.email}
      onboardingLevel={person.onboardingLevel}
      isMentor={isMentor}
      archetypeName={archetypeName || ''}
      primaryCraftName={interests[0]?.name}
      station={station}
      city={city}
      region={region}
      connectionStyle={person.connectionStyle || undefined}
      latitude={person.latitude || undefined}
      longitude={person.longitude || undefined}
    >
      <main className="bg-white p-8">
        <ProfileClient
          person={person as PersonWithRelations}
          interests={interests}
        />
      </main>
    </DashboardClient>
  )
}
