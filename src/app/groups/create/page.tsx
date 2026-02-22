import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { DashboardClient } from '@/components/DashboardClient'
import { CreateGroupClient } from '@/components/CreateGroupClient'

export default async function CreateGroupPage() {
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
  const interests = person.interests.map(pi => ({
    ...pi.interest,
    proficiencyLevel: pi.proficiencyLevel,
  }))

  // Calculate mentor status
  const mentorCount = interests.filter(pi => pi.proficiencyLevel >= 4).length
  const isMentor = mentorCount > 0

  // Extract archetype directly from person
  const archetypeName = person.archetype

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
      <main className="bg-white p-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Home</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
            <span>Groups</span>
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
            <span className="text-gray-900 font-medium">Create Group</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Start a New Group
          </h1>
        </div>

        <CreateGroupClient />
      </main>
    </DashboardClient>
  )
}
