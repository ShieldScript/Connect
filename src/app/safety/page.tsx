import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ChevronRight, Shield, Lock, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { DashboardClient } from '@/components/DashboardClient'

export default async function SafetyPage() {
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
  const interests = person.interests.filter(pi => pi.interest != null).map(pi => ({
    ...pi.interest!,
    proficiencyLevel: pi.proficiencyLevel,
  }))

  // Calculate mentor status
  const mentorCount = interests.filter(pi => pi.proficiencyLevel >= 4).length
  const isMentor = mentorCount > 0

  // Extract archetype directly from person
  const archetypeName = person.archetype

  const safetyFeatures = [
    {
      title: "Multi-Level Onboarding",
      description: "We don't just let anyone join any group. Users progress from 'App-Ready' to 'Group-Verified' through surveys and shepherd reviews.",
      icon: Shield,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Proximity Privacy",
      description: "Your exact location is never shared. We use approximate grids to show you're 'nearby' without compromising your home address.",
      icon: Lock,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Identity First",
      description: "Profiles are focused on interests and values, not just photos. This reduces 'swiping' culture and encourages real connection.",
      icon: Eye,
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ]

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
      <main className="bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-8">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>Home</span>
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
              <span className="text-gray-900 font-medium">Safety</span>
            </div>
          </div>
          <div className="max-w-3xl">
            <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-xl mb-4 shadow-lg shadow-blue-200">
              <Shield size={28} strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Safety & Shepherding</h1>
            <p className="text-base text-gray-600">
              Our person-first model is built on trust. We provide the tools to build meaningful community safely.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safetyFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className={`${feature.bg} ${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon size={24} strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>

          {/* Verification Levels */}
          <section className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-blue-600" strokeWidth={2} /> Verification Roadmap
            </h2>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                  <div className="w-0.5 h-full bg-gray-100 mt-2" />
                </div>
                <div className="pb-8">
                  <h4 className="font-bold text-lg mb-1">App Onboarding</h4>
                  <p className="text-gray-500 text-sm">Basic identity, interests, and proximity settings. You are now visible to groups and people nearby.</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wider">
                    {person.onboardingLevel >= 1 ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold">2</div>
                  <div className="w-0.5 h-full bg-gray-100 mt-2" />
                </div>
                <div className="pb-8">
                  <h4 className="font-bold text-lg mb-1">Group Alignment</h4>
                  <p className="text-gray-500 text-sm">Joining specific groups may require answering alignment questions or agreeing to group values.</p>
                  <button className="mt-3 text-blue-600 text-sm font-bold hover:underline">Start Survey</button>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold">3</div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Shepherd Review</h4>
                  <p className="text-gray-500 text-sm">For premium or sensitive groups, a group leader (Shepherd) manually reviews and approves members.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Reporting */}
          <section className="bg-red-50 border border-red-100 rounded-lg p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <AlertTriangle className="text-red-600" size={40} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900 mb-2">Need to report something?</h2>
              <p className="text-red-700 text-sm mb-4">
                If you encounter misuse, harassment, or a group that doesn't align with our safety values, our shepherds are here to help.
              </p>
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition">
                Open Safety Report
              </button>
            </div>
          </section>
        </div>
      </main>
    </DashboardClient>
  )
}
