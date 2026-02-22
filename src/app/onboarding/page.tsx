'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Hammer, Flame, Radio, User, MapPin, Wrench, Shield, Check, BookOpen, Heart, Users, MessageCircle, Home, Briefcase, DollarSign, HandHeart, Book, Lock, ShieldCheck, MessageSquare, Calendar, Sparkles, TrendingUp, UserCheck, AlertTriangle } from 'lucide-react'

interface Interest {
  id: string
  name: string
  category: string
  metadata?: any
}

interface InterestWithProficiency {
  interestId: string
  proficiencyLevel: number // 1-3: Beginner, Intermediate, Expert
}

// Light Stewardship Color Palette
const colors = {
  background: '#F8FAFC', // Off-White/Light Grey
  surface: '#FFFFFF', // Pure White
  primary: '#2563EB', // Royal Blue
  text: '#1E293B', // Deep Charcoal
  expertBg: '#FEF3C7', // Soft Gold Background
  expertText: '#B45309', // Gold Text
}

// Category tabs with Biblical context
const categories = [
  {
    id: 'outdoor_adventure',
    label: 'Outdoor Adventure',
    header: 'The mountains are His cathedral.',
    quote: 'Iron sharpens iron... in the wild, men find clarity and brotherhood.'
  },
  {
    id: 'craftsmanship_trades_maker',
    label: 'Craftsmanship & Trades',
    header: 'Your hands echo the Creator\'s work.',
    quote: 'Every tool is a gift. Every craft a calling. Build with purpose.'
  },
  {
    id: 'physicality_combat_team_sports',
    label: 'Physical & Sports',
    header: 'Strength is meant to be spent in service.',
    quote: 'Train the body, forge the will, serve the weak, honor the brotherhood.'
  },
  {
    id: 'culinary_fire_food',
    label: 'Culinary & Food',
    header: 'The table is where fellowship happens.',
    quote: 'Bread broken together turns strangers into brothers. Cook with intention.'
  },
  {
    id: 'strategy_mentorship_leadership',
    label: 'Strategy & Leadership',
    header: 'A shepherd\'s burden is his calling.',
    quote: 'Lead not for glory, but for the good of those you serve.'
  },
  {
    id: 'faith_formation_relational',
    label: 'Faith & Formation',
    header: 'The Word shapes the man.',
    quote: 'Scripture. Prayer. Accountability. This is the foundation of a righteous life.'
  },
  {
    id: 'service_civic_community',
    label: 'Service & Community',
    header: 'Love in action, not just in word.',
    quote: 'The mark of faith is the willingness to serve the unseen and forgotten.'
  },
  {
    id: 'creative_cultural',
    label: 'Creative & Cultural',
    header: 'Art reflects the image of God.',
    quote: 'Create beauty, tell truth, honor heritage. Your creativity glorifies the Maker.'
  },
  {
    id: 'digital_tech',
    label: 'Digital & Tech',
    header: 'Innovation in service of the Kingdom.',
    quote: 'Use technology to connect, create, and serve. Your skills can amplify the Gospel.'
  },
]

// Character Archetypes - Professional Character Briefs
const archetypes = [
  {
    id: 'sage',
    label: 'The Sage',
    brief: 'Dedicated to providing biblical wisdom and thoughtful counsel to the group.',
    alignment: 'High Faith / Leadership'
  },
  {
    id: 'builder',
    label: 'The Builder',
    brief: 'Focused on tangible results, craftsmanship, and the satisfaction of a job well done.',
    alignment: 'High Crafts / Trades'
  },
  {
    id: 'guardian',
    label: 'The Guardian',
    brief: 'Committed to the safety and protection of the fellowship.',
    alignment: 'High Physical / Service'
  },
  {
    id: 'navigator',
    label: 'The Navigator',
    brief: 'Finds the path forward, coordinating logistics and strategic planning for the community.',
    alignment: 'High Strategy / Outdoor'
  },
  {
    id: 'steward',
    label: 'The Steward',
    brief: 'Ensures resources are managed well and that every member has what they need to thrive.',
    alignment: 'High Service / Strategy'
  },
  {
    id: 'architect',
    label: 'The Architect',
    brief: 'Sees the big picture and designs the systems or structures that keep the group organized.',
    alignment: 'High Creative / Strategy'
  },
  {
    id: 'provider',
    label: 'The Provider',
    brief: 'Focuses on hospitality, nourishment, and creating a welcoming environment for all.',
    alignment: 'High Culinary / Service'
  },
  {
    id: 'scout',
    label: 'The Scout',
    brief: 'Always looking for new opportunities, terrain, and challenges for the group to conquer.',
    alignment: 'High Outdoor / Physical'
  },
  {
    id: 'artisan',
    label: 'The Artisan',
    brief: 'Brings beauty and creative excellence to the group\'s projects and expressions.',
    alignment: 'High Creative / Crafts'
  },
  {
    id: 'encourager',
    label: 'The Encourager',
    brief: 'Dedicated to relational health, checking in on brothers, and building morale.',
    alignment: 'High Faith / Service'
  },
]

// Spiritual Goals (Phase 5)
const spiritualGoalsOptions = [
  { id: 'scripture', label: 'Scripture Study', icon: BookOpen },
  { id: 'prayer', label: 'Prayer Life', icon: Heart },
  { id: 'discipled', label: 'Being Discipled', icon: Users },
  { id: 'evangelism', label: 'Evangelism & Witness', icon: MessageCircle },
  { id: 'marriage', label: 'Marriage & Family', icon: Home },
  { id: 'purity', label: 'Sexual Purity', icon: Shield },
  { id: 'work', label: 'Work & Calling', icon: Briefcase },
  { id: 'stewardship', label: 'Financial Stewardship', icon: DollarSign },
  { id: 'serving', label: 'Serving & Leadership', icon: HandHeart },
  { id: 'theology', label: 'Theology & Doctrine', icon: Book },
]

// Accountability Areas (Phase 5 - Private)
const accountabilityAreasOptions = [
  'Sexual Purity & Lust',
  'Anger & Conflict',
  'Marriage & Intimacy',
  'Parenting Challenges',
  'Work & Career Stress',
  'Financial Discipline',
  'Addiction & Habits',
  'Anxiety & Mental Health',
  'Spiritual Dryness',
  'Pride & Comparison',
  'Time & Priorities',
  'Other (General Support)',
]

// Phase Progress Component
function PhaseProgress({ phase }: { phase: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5, 6, 7].map((p) => (
        <div
          key={p}
          className={`h-2.5 w-14 rounded-full transition-all duration-500 ${
            p <= phase ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="ml-3 text-base text-gray-600 font-semibold">Step {phase} of 7</span>
    </div>
  )
}

export default function OnboardingPage() {
  const [phase, setPhase] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingInterests, setLoadingInterests] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Phase 1: Claim Your Identity (Display Name + Location)
  const [displayName, setDisplayName] = useState('')
  const [community, setCommunity] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [geocodedLocationName, setGeocodedLocationName] = useState<string>('')
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false)

  // Phase 2: Defining Stewardship (Interest Matrix)
  const [interests, setInterests] = useState<Interest[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('outdoor_adventure')
  const [selectedInterests, setSelectedInterests] = useState<InterestWithProficiency[]>([])
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  // Phase 3: Operational Mode
  const [operationalMode, setOperationalMode] = useState<string>('')

  // Phase 4: Archetype Alignment
  const [selectedArchetype, setSelectedArchetype] = useState<string>('')

  // Phase 5: Covenant Commitment
  const [churchAffiliation, setChurchAffiliation] = useState('')
  const [spiritualGoals, setSpiritualGoals] = useState<string[]>([])
  const [accountabilityAreas, setAccountabilityAreas] = useState<string[]>([])
  const [covenantAgreed, setCovenantAgreed] = useState(false)

  // Phase 6: Bio (optional - was Phase 5)
  const [bio, setBio] = useState('')
  const [hasAssets, setHasAssets] = useState<boolean | null>(null)
  const [notifyForNewGroups, setNotifyForNewGroups] = useState<boolean>(true)

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const res = await fetch('/api/interests')
        if (!res.ok) throw new Error('Failed to fetch interests')
        const data = await res.json()
        setInterests(data.interests || [])
      } catch (err) {
        console.error('Failed to fetch interests:', err)
        setError('Failed to load interests. Please refresh the page.')
      } finally {
        setLoadingInterests(false)
      }
    }

    fetchInterests()
  }, [])

  // Forward geocode: Convert manual address input to lat/lng for 5km radius filter
  const geocodeAddress = async () => {
    if (!city.trim() || !region.trim()) {
      console.warn('⚠️ City and region required for geocoding')
      return null
    }

    setIsGeocodingAddress(true)

    try {
      // Build query from manual inputs
      const query = [community, city, region].filter(Boolean).join(', ')
      console.log('🗺️ Geocoding address:', query)

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'ConnectApp/1.0' } }
      )
      const data = await response.json()

      console.log('📍 Geocoding response:', data)

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        const geocodedName = data[0].display_name
        console.log('✅ Location set:', { lat, lng, name: geocodedName })
        console.log(`🗺️ Geocoded to: ${geocodedName}`)
        setLocation({ latitude: lat, longitude: lng })
        setGeocodedLocationName(geocodedName)

        // Show confirmation alert if geocoding seems off
        if (!geocodedName.toLowerCase().includes(community.toLowerCase()) && community.trim()) {
          console.warn(`⚠️ Geocoding mismatch! You entered "${community}" but got "${geocodedName}"`)
        }

        return { latitude: lat, longitude: lng }
      } else {
        console.warn('⚠️ Geocoding returned no results, using default location')
        // Fallback to default location (center of US) if geocoding fails
        const fallback = { latitude: 39.8283, longitude: -98.5795 }
        setLocation(fallback)
        return fallback
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error)
      // Fallback to default location on error
      const fallback = { latitude: 39.8283, longitude: -98.5795 }
      setLocation(fallback)
      return fallback
    } finally {
      setIsGeocodingAddress(false)
    }
  }

  const setProficiencyLevel = (interestId: string, level: number) => {
    const existing = selectedInterests.find(si => si.interestId === interestId)

    if (existing) {
      setSelectedInterests(
        selectedInterests.map(si =>
          si.interestId === interestId
            ? { ...si, proficiencyLevel: level }
            : si
        )
      )
    } else {
      setSelectedInterests([
        ...selectedInterests,
        { interestId, proficiencyLevel: level }
      ])
    }
  }

  const removeInterest = (interestId: string) => {
    setSelectedInterests(selectedInterests.filter(si => si.interestId !== interestId))
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Scroll the selected category into view
    setTimeout(() => {
      categoryRefs.current[categoryId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }, 0)
  }

  // Get suggested archetypes based on stewardship
  const getSuggestedArchetypes = (): string[] => {
    // Try mentor level first, then fall back to all interests
    let categoriesToConsider = selectedInterests
      .filter(si => si.proficiencyLevel === 3)
      .map(si => {
        const interest = interests.find(i => i.id === si.interestId)
        return interest?.category
      })

    // If no mentor areas, use all selected interests
    if (categoriesToConsider.length === 0) {
      categoriesToConsider = selectedInterests.map(si => {
        const interest = interests.find(i => i.id === si.interestId)
        return interest?.category
      })
    }

    const suggestions: string[] = []

    // Map categories to archetypes
    if (categoriesToConsider.includes('faith_formation_relational') || categoriesToConsider.includes('strategy_mentorship_leadership')) {
      suggestions.push('sage', 'encourager')
    }
    if (categoriesToConsider.includes('craftsmanship_trades_maker') || categoriesToConsider.includes('creative_cultural')) {
      suggestions.push('builder', 'artisan')
    }
    if (categoriesToConsider.includes('physicality_combat_team_sports') || categoriesToConsider.includes('outdoor_adventure')) {
      suggestions.push('guardian', 'scout')
    }
    if (categoriesToConsider.includes('culinary_fire_food') || categoriesToConsider.includes('service_civic_community')) {
      suggestions.push('provider', 'steward')
    }
    if (categoriesToConsider.includes('strategy_mentorship_leadership')) {
      suggestions.push('navigator', 'architect')
    }
    if (categoriesToConsider.includes('digital_tech')) {
      suggestions.push('architect', 'builder')
    }

    // Remove duplicates and limit to top 3
    return [...new Set(suggestions)].slice(0, 3)
  }

  const getProficiencyLabel = (level: number): string => {
    const labels: Record<number, string> = {
      1: 'Beginner',
      2: 'Intermediate',
      3: 'Expert'
    }
    return labels[level] || 'Beginner'
  }

  const getProficiencyDesc = (level: number): string => {
    const descriptions: Record<number, string> = {
      1: "I'm here to learn",
      2: "I can help others",
      3: "I can mentor/lead"
    }
    return descriptions[level] || ''
  }

  const handleComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      const proficiencyLevels = selectedInterests.reduce((acc, si) => {
        const interest = interests.find(i => i.id === si.interestId)
        if (interest) {
          acc[interest.name] = si.proficiencyLevel
        }
        return acc
      }, {} as Record<string, number>)

      const hasExpertLevel = selectedInterests.some(si => si.proficiencyLevel === 3)
      const willingness = hasExpertLevel ? 'share_skills' : operationalMode === 'workshop' ? 'help_organize' : 'participate'

      // Validate location exists
      if (!location?.latitude || !location?.longitude) {
        throw new Error('Location is required. Please go back to Phase 1 and ensure your city and region are entered correctly.')
      }

      const payload = {
        displayName: displayName.trim(),
        interests: selectedInterests.map(si => ({
          interestId: si.interestId,
          proficiencyLevel: si.proficiencyLevel === 1 ? 2 : si.proficiencyLevel === 2 ? 3 : 5,
        })),
        bio: bio.trim() || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        community: community.trim(),
        city: city.trim(),
        region: region.trim(),
        archetype: selectedArchetype,
        connectionStyle: operationalMode,
        leadershipSignals: {
          willingness,
          hasAssets: hasAssets || false,
          notifyForNewGroups,
        },
        covenantData: {
          churchAffiliation: churchAffiliation || undefined,
          spiritualGoals,
          accountabilityAreas,
          covenantAgreedAt: new Date().toISOString(),
        },
      }

      console.log('📤 Sending onboarding payload:', payload)

      const res = await fetch('/api/persons/me/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log('Response status:', res.status)

      let data
      try {
        data = await res.json()
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        throw new Error(`Server error (${res.status}): Unable to parse response`)
      }

      if (!res.ok) {
        console.error('Validation error details:', data)
        console.error('Response status:', res.status)
        throw new Error(data.error || data.details?.[0]?.message || `Onboarding failed (${res.status})`)
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      console.error('Onboarding failed:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      setPhase(1)
    } finally {
      setLoading(false)
    }
  }

  const filteredInterests = interests.filter(i => i.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - THE PATH TO FELLOWSHIP - Vertical Stepper */}
      <aside className="hidden md:block w-64 fixed left-0 top-0 h-full bg-slate-50 border-r border-gray-200 p-8 pt-12">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">
          THE PATH TO FELLOWSHIP
        </h2>

        <p className="text-xs text-gray-600 italic leading-relaxed mb-8 border-l-2 border-blue-300 pl-3">
          "Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms."
          <span className="block text-[10px] text-gray-500 mt-1 not-italic">— 1 Peter 4:10</span>
        </p>

        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-gray-200"></div>

          {/* Steps */}
          <div className="space-y-6 relative">
            {[
              { number: 1, label: 'Claim Your Identity', active: phase === 1 },
              { number: 2, label: 'Identify Your Craft', active: phase === 2 },
              { number: 3, label: 'Discover Your Archetype', active: phase === 3 },
              { number: 4, label: 'Set Your Style', active: phase === 4 },
              { number: 5, label: 'Spiritual Foundation', active: phase === 5 },
              { number: 6, label: 'Code of Conduct', active: phase === 6 },
              { number: 7, label: 'Join the Fellowship', active: phase === 7 },
            ].map((step) => (
              <div key={step.number} className="flex items-center gap-3">
                {/* Circle or Checkmark */}
                <div
                  className={`w-3 h-3 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    step.active
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : phase > step.number
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {phase > step.number ? (
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  ) : (
                    step.number
                  )}
                </div>
                {/* Label */}
                <span
                  className={`text-sm ${
                    step.active
                      ? 'font-bold text-gray-900'
                      : phase > step.number
                      ? 'font-medium text-gray-700'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-0">
        <div className="max-w-5xl mx-auto p-6">
          <PhaseProgress phase={phase} />

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Phase 1: Claim Your Identity - Manual Entry */}
          {phase === 1 && (
            <div className="flex flex-col">
              <div className="max-w-2xl mx-auto py-12">
                  <div className="max-w-xl mx-auto">
                    {/* Header - Center Stage */}
                    <div className="text-center mb-10">
                      <h1 className="text-4xl font-bold mb-3 text-gray-900">
                        Claim Your Identity
                      </h1>
                      <p className="text-gray-600 text-base">
                        Let the brotherhood know who you are and where you're located
                      </p>
                    </div>

                    {/* The Form */}
                    <div className="space-y-8">
                      {/* Field 1: Display Name - Standalone */}
                      <div className="relative bg-gray-50 px-4 py-4 rounded-lg">
                        <input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder=" "
                          className="peer w-full text-lg px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors bg-transparent placeholder-transparent"
                          maxLength={50}
                        />
                        <label htmlFor="displayName" className="absolute left-4 top-1 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-6 peer-focus:top-1 peer-focus:text-gray-600 peer-focus:text-sm cursor-text">
                          How should the brotherhood address you?
                        </label>
                        {displayName.trim().length >= 2 && (
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Field 2: Bio - Optional */}
                      <div className="relative bg-gray-50 px-4 py-4 pb-2 rounded-lg">
                        <textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder=" "
                          rows={3}
                          className="peer w-full text-base px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors bg-transparent placeholder-transparent resize-none"
                          maxLength={200}
                        />
                        <label htmlFor="bio" className="absolute left-4 top-1 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-6 peer-focus:top-1 peer-focus:text-gray-600 peer-focus:text-sm cursor-text">
                          Tell the brothers about yourself (optional)
                        </label>
                        <div className="text-right mt-1">
                          <span className={`text-xs ${bio.length > 180 ? 'text-amber-600' : 'text-gray-400'}`}>
                            {bio.length}/200
                          </span>
                        </div>
                      </div>

                      {/* Section Header: Your Location */}
                      <div className="pt-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                          Your Location
                        </h2>

                        {/* Location Card - Grouped Container */}
                        <div className="bg-[#f9f9f9] border border-gray-200 rounded-lg p-6 space-y-6">
                          {/* Field 3: Community with Info Icon */}
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-1">
                              <label htmlFor="community" className="text-sm text-gray-700 cursor-text">
                                Community or Neighborhood
                              </label>
                              <div className="group relative">
                                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {/* Tooltip */}
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-10">
                                  We use your community to find brothers in your immediate neighborhood.
                                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                            <input
                              id="community"
                              type="text"
                              value={community}
                              onChange={(e) => setCommunity(e.target.value)}
                              placeholder="e.g., Brooklyn Heights, Downtown, The Heights"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                              maxLength={100}
                            />
                            {community.trim() && (
                              <div className="absolute right-3 top-10">
                                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Fields 4 & 5: City (60%) and Region (40%) - Split Row */}
                          <div className="flex gap-4">
                            {/* City - 60% */}
                            <div className="relative flex-[3]">
                              <label htmlFor="city" className="block text-sm text-gray-700 mb-1 cursor-text">
                                City
                              </label>
                              <input
                                id="city"
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="e.g., Portland"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                maxLength={100}
                              />
                              {city.trim() && (
                                <div className="absolute right-3 top-10">
                                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Region - 40% */}
                            <div className="relative flex-[2]">
                              <label htmlFor="region" className="block text-sm text-gray-700 mb-1 cursor-text">
                                Region / State
                              </label>
                              <input
                                id="region"
                                type="text"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                placeholder="e.g., Oregon"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                maxLength={100}
                              />
                              {region.trim() && (
                                <div className="absolute right-3 top-10">
                                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Fixed Footer - Action Zone */}
              <div className="p-4">
                <div className="max-w-xl mx-auto">
                  {/* Geocoded Location Confirmation */}
                  {geocodedLocationName && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Location Mapped:</p>
                          <p className="text-xs text-blue-700">{geocodedLocationName}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      // Geocode address to get lat/lng for 5km radius filter
                      await geocodeAddress()
                      setPhase(2)
                    }}
                    disabled={!displayName.trim() || displayName.trim().length < 2 || !community.trim() || !city.trim() || !region.trim() || isGeocodingAddress}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                      displayName.trim().length >= 2 && community.trim() && city.trim() && region.trim() && !isGeocodingAddress
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isGeocodingAddress
                      ? 'Mapping...'
                      : 'Continue to Stewardship'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 2: Defining Stewardship - EXPANDING GRID CARDS */}
          {phase === 2 && (
            <div className="flex flex-col h-[calc(100vh-120px)]">
              {/* STICKY HEADER - Zone 1 (Never moves) */}
              <div className="sticky top-0 bg-gray-50 z-20 pb-4 border-b border-gray-200">
                <div className="text-center mb-5">
                  <h1 className="text-3xl font-bold mb-2 text-gray-900">
                    Define Your Stewardship
                  </h1>
                  <p className="text-gray-600 text-base">Select 3-5 areas where you'd like to connect ({selectedInterests.length}/5)</p>
                </div>

                {/* Category Pills - With Edge Fade & Peek-a-boo */}
                <div className="relative -mx-1">
                  {/* Edge Fade Gradient - Visual Cue for More Content */}
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10"></div>

                  {/* Scrollable Category Bar with Peek-a-boo UI */}
                  <div className="flex gap-2 overflow-x-auto pb-2 px-1 pr-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        ref={(el) => { categoryRefs.current[cat.id] = el; }}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`flex-shrink-0 px-5 py-2.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                          selectedCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-md scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm border border-gray-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* THE VIEWPORT - Zone 2 (Scrollable content) */}
              <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {loadingInterests ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {filteredInterests.map((interest) => {
                      const selected = selectedInterests.find(si => si.interestId === interest.id)
                      const isMaxed = selectedInterests.length >= 5 && !selected
                      const isMentor = selected?.proficiencyLevel === 3
                      const isPractitioner = selected?.proficiencyLevel === 2
                      const isLearner = selected?.proficiencyLevel === 1

                      return (
                        <div
                          key={interest.id}
                          className={`relative rounded-xl transition-all duration-300 min-h-[140px] flex flex-col ${
                            isMentor
                              ? 'border-2 border-amber-500 bg-amber-50 shadow-lg border-t-4'
                              : selected
                              ? 'border-2 border-blue-600 bg-blue-50 shadow-md'
                              : isMaxed
                              ? 'border-2 border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
                              : 'border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer'
                          }`}
                        >
                          {/* Card Content - FIXED HEIGHT */}
                          <div className="p-4 flex-1 flex flex-col">
                            {/* Discovery State: Just title + icon */}
                            {!selected && (
                              <button
                                onClick={() => !isMaxed && setProficiencyLevel(interest.id, 1)}
                                disabled={isMaxed}
                                className="w-full h-full text-left group flex items-center justify-between"
                              >
                                <span className="font-medium text-sm text-gray-900 leading-tight pr-2">
                                  {interest.name}
                                </span>
                                <span className="text-gray-400 group-hover:text-blue-600 text-2xl flex-shrink-0 transition-colors">
                                  +
                                </span>
                              </button>
                            )}

                            {/* Lock-In State: Title + Overlay Controls */}
                            {selected && (
                              <div className="h-full flex flex-col">
                                {/* Header with Remove */}
                                <div className="flex items-start justify-between mb-2">
                                  <span className={`font-semibold text-sm leading-tight pr-2 ${
                                    isMentor ? 'text-amber-900' : 'text-gray-900'
                                  }`}>
                                    {interest.name}
                                  </span>
                                  <button
                                    onClick={() => removeInterest(interest.id)}
                                    className={`${
                                      isMentor ? 'text-amber-400 hover:text-amber-600' : 'text-gray-400 hover:text-red-600'
                                    } transition-colors flex-shrink-0`}
                                    title="Remove"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>

                                {/* Overlay Drawer: Segmented Toggle - OVERLAYS bottom of card */}
                                <div className="mt-auto">
                                  <div className={`flex gap-0.5 rounded-lg p-0.5 ${
                                    isMentor ? 'bg-amber-200' : 'bg-gray-200'
                                  }`}>
                                    {[
                                      { level: 1, label: 'Learner' },
                                      { level: 2, label: 'Practitioner' },
                                      { level: 3, label: 'Mentor' }
                                    ].map(({ level, label }) => (
                                      <button
                                        key={level}
                                        onClick={() => setProficiencyLevel(interest.id, level)}
                                        className={`flex-1 px-2 py-2 rounded-md text-xs font-bold transition-all ${
                                          selected.proficiencyLevel === level
                                            ? level === 3
                                              ? 'bg-amber-500 text-white shadow-md'
                                              : 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                      >
                                        {label}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Stewardship Feedback Text */}
                                  <div className="mt-2">
                                    <p className={`text-xs italic leading-relaxed ${
                                      isMentor ? 'text-amber-800' : 'text-gray-600'
                                    }`}>
                                      {selected.proficiencyLevel === 1 && 'Seeking to grow and learn from brothers in this craft.'}
                                      {selected.proficiencyLevel === 2 && 'Open to shoulder-to-shoulder connection and peer growth.'}
                                      {selected.proficiencyLevel === 3 && 'Willing to guide and invest in those starting this journey.'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ACTION FOOTER - Zone 3 (Never moves, always visible) */}
              <div className="sticky bottom-0 p-4 z-20">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                  <button
                    onClick={() => setPhase(1)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setPhase(3)}
                    disabled={selectedInterests.length < 3}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                      selectedInterests.length >= 3
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {selectedInterests.length < 3
                      ? `Select ${3 - selectedInterests.length} more to continue`
                      : `Continue (${selectedInterests.length}/5 selected)`
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 3: Connection Style - Top-Weighted Stage Layout */}
          {phase === 3 && (
            <div className="flex flex-col">
              {/* Header - Top Weighted */}
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  How Do You Connect Best?
                </h1>
                <p className="text-gray-600 text-base">Choose your preferred style of fellowship</p>
              </div>

              {/* Content Stage - Vertically Stacked, Top Positioned */}
              <div className="max-w-3xl mx-auto w-full space-y-4">
                <button
                  onClick={() => setOperationalMode('workshop')}
                  className={`w-full p-8 rounded-xl border transition-all text-left ${
                    operationalMode === 'workshop'
                      ? 'border-2 border-blue-600 bg-blue-50 shadow-md'
                      : 'border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Hammer className="w-6 h-6 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
                      <h3 className="text-2xl font-bold text-gray-900">Builders</h3>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                      Shoulder-to-Shoulder
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Building, creating, and working together on shared projects and hands-on challenges.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setOperationalMode('fireside')}
                  className={`w-full p-8 rounded-xl border transition-all text-left ${
                    operationalMode === 'fireside'
                      ? 'border-2 border-blue-600 bg-blue-50 shadow-md'
                      : 'border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Flame className="w-6 h-6 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
                      <h3 className="text-2xl font-bold text-gray-900">The Fireside</h3>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                      Face-to-Face
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Conversation, study, and deep fellowship focused on growth and accountability.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setOperationalMode('outpost')}
                  className={`w-full p-8 rounded-xl border transition-all text-left ${
                    operationalMode === 'outpost'
                      ? 'border-2 border-blue-600 bg-blue-50 shadow-md'
                      : 'border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Radio className="w-6 h-6 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
                      <h3 className="text-2xl font-bold text-gray-900">Bridge</h3>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                      Digital-to-Digital
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed">
                      Consistent connection through digital channels and intellectual exchange.
                    </p>
                  </div>
                </button>
              </div>

              {/* Fixed Footer Dock - Action Zone */}
              <div className="p-4">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                  <button
                    onClick={() => setPhase(2)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setPhase(4)}
                    disabled={!operationalMode}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                      operationalMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {operationalMode ? 'Continue' : 'Select Your Connection Style'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 4: Archetype Alignment - Dynamic Split Layout */}
          {phase === 4 && (
            <div className="flex flex-col h-[calc(100vh-120px)]">
              {/* Header - Fixed at top */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  Which Role Resonates With You?
                </h1>
                <p className="text-gray-600 text-base">This helps us match you with like-minded people</p>
              </div>

              {/* Scrollable Viewport with Bottom Fade */}
              <div className="flex-1 relative overflow-hidden">
                {/* Bottom Gradient Fade - Visual Cue */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10"></div>

                {/* Dynamic Split Layout - Scrollable */}
                <div className="h-full overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {/* SPOTLIGHT SECTION - Your Best Fit */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Your Best Fit</h2>
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Recommended</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getSuggestedArchetypes().map((archetypeId) => {
                        const archetype = archetypes.find(a => a.id === archetypeId)
                        if (!archetype) return null

                        const isSuggested = true
                        const isSelected = selectedArchetype === archetype.id

                        return (
                          <button
                            key={archetype.id}
                            onClick={() => setSelectedArchetype(archetype.id)}
                            className={`relative p-6 rounded-xl border-2 transition-all text-left min-h-[180px] flex flex-col ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 shadow-lg'
                                : selectedInterests.some(si => si.proficiencyLevel === 3)
                                ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white hover:border-amber-400 hover:shadow-md'
                                : 'border-blue-300 bg-gradient-to-br from-blue-50 to-white hover:border-blue-400 hover:shadow-md'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{archetype.label}</h3>
                                {isSelected && (
                                  <span className="flex-shrink-0 ml-2 text-blue-600">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                              <p className="text-base text-gray-700 leading-relaxed mb-3">
                                {archetype.brief}
                              </p>
                            </div>
                            <div className="mt-auto space-y-2">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                {archetype.alignment}
                              </p>
                              <div className={`text-xs font-medium px-3 py-1.5 rounded-full inline-block ${
                                selectedInterests.some(si => si.proficiencyLevel === 3)
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                Suggested based on your stewardship
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* OTHER ROLES SECTION - Browse All */}
                  <div className="pb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-700">Other Roles</h2>
                      <span className="text-xs text-gray-500">Browse all archetypes</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {archetypes
                        .filter(a => !getSuggestedArchetypes().includes(a.id))
                        .map((archetype) => {
                          const isSelected = selectedArchetype === archetype.id

                          return (
                            <button
                              key={archetype.id}
                              onClick={() => setSelectedArchetype(archetype.id)}
                              className={`p-6 rounded-xl border transition-all text-left min-h-[160px] flex flex-col ${
                                isSelected
                                  ? 'border-2 border-blue-600 bg-blue-50 shadow-md'
                                  : 'border border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">{archetype.label}</h3>
                                  {isSelected && (
                                    <span className="flex-shrink-0 ml-2 text-blue-600">
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                                <p className="text-base text-gray-700 leading-relaxed mb-3">
                                  {archetype.brief}
                                </p>
                              </div>
                              <div className="mt-auto">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                  {archetype.alignment}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer Dock - Action Zone */}
              <div className="sticky bottom-0 p-4 z-20">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                  <button
                    onClick={() => setPhase(3)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setPhase(5)}
                    disabled={!selectedArchetype}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                      selectedArchetype
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {selectedArchetype ? 'Finalize Profile' : 'Select a Role to Continue'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 5: Covenant Commitment - Spiritual Foundation */}
          {phase === 5 && (
            <div className="flex flex-col h-[calc(100vh-120px)]">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  Your Spiritual Foundation
                </h1>
                <p className="text-gray-600 text-base">
                  Help us connect you with brothers who share your faith journey
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pb-24">
                <div className="max-w-3xl mx-auto space-y-8">
                  {/* Church Affiliation (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Church Tradition <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={churchAffiliation}
                      onChange={(e) => setChurchAffiliation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select your church tradition...</option>
                      <option value="catholic">Catholic</option>
                      <option value="orthodox">Orthodox</option>
                      <option value="anglican">Anglican / Episcopalian</option>
                      <option value="baptist">Baptist</option>
                      <option value="methodist">Methodist</option>
                      <option value="lutheran">Lutheran</option>
                      <option value="presbyterian">Presbyterian</option>
                      <option value="reformed">Reformed</option>
                      <option value="pentecostal">Pentecostal / Charismatic</option>
                      <option value="evangelical">Evangelical</option>
                      <option value="nondenominational">Non-Denominational</option>
                      <option value="other">Other / Independent</option>
                    </select>
                  </div>

                  {/* Spiritual Goals (Multi-select, min 1, max 3) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Growth Areas <span className="text-gray-500 font-normal">(Select 1-3)</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-3">What areas are you focused on growing in?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {spiritualGoalsOptions.map((goal) => {
                        const isSelected = spiritualGoals.includes(goal.id)
                        const Icon = goal.icon
                        return (
                          <button
                            key={goal.id}
                            onClick={() => {
                              if (isSelected) {
                                setSpiritualGoals(spiritualGoals.filter(g => g !== goal.id))
                              } else if (spiritualGoals.length < 3) {
                                setSpiritualGoals([...spiritualGoals, goal.id])
                              }
                            }}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                              <span className={`font-semibold text-sm ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                {goal.label}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-blue-600 absolute top-2 right-2" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {spiritualGoals.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {spiritualGoals.length}/3 selected
                      </p>
                    )}
                  </div>

                  {/* Accountability Areas (Multi-select, min 1, PRIVATE) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Accountability Areas <span className="text-gray-500 font-normal">(Select at least 1)</span>
                    </label>
                    <div className="flex items-center gap-2 mb-3">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-xs text-gray-500">Private & only shared when you choose</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {accountabilityAreasOptions.map((area) => {
                        const isSelected = accountabilityAreas.includes(area)
                        return (
                          <button
                            key={area}
                            onClick={() => {
                              if (isSelected) {
                                setAccountabilityAreas(accountabilityAreas.filter(a => a !== area))
                              } else {
                                setAccountabilityAreas([...accountabilityAreas, area])
                              }
                            }}
                            className={`p-3 rounded-lg border transition-all text-left flex items-center gap-3 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                            </div>
                            <span className={`text-sm ${isSelected ? 'text-blue-900 font-semibold' : 'text-gray-700'}`}>
                              {area}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                  <button
                    onClick={() => setPhase(4)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setPhase(6)}
                    disabled={spiritualGoals.length < 1 || accountabilityAreas.length < 1}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                      spiritualGoals.length >= 1 && accountabilityAreas.length >= 1
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {spiritualGoals.length < 1
                      ? 'Select at least 1 growth area'
                      : accountabilityAreas.length < 1
                      ? 'Select at least 1 accountability area'
                      : 'Continue to Code of Conduct'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 6: Code of Conduct */}
          {phase === 6 && (
            <div className="flex flex-col h-[calc(100vh-120px)]">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="w-12 h-12 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold mb-3 text-gray-900">
                  Code of Conduct
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  This is a Christ-centered community built on trust, respect, and confidentiality
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pb-24">
                <div className="max-w-3xl mx-auto">
                  {/* Covenant Principles */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-8 space-y-6">
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-6 h-6 text-blue-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Honor Confidentiality</h3>
                        <p className="text-gray-700">What's shared in your huddle stays in your huddle. Build trust through discretion.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-green-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Speak with Respect</h3>
                        <p className="text-gray-700">Assume good intentions. Challenge ideas gently. Speak truth in love.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-purple-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Show Up Consistently</h3>
                        <p className="text-gray-700">Commitment matters. Communicate when you can't make it. Your brothers rely on you.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-6 h-6 text-orange-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Be Honest About Struggles</h3>
                        <p className="text-gray-700">Vulnerability creates connection. Share your battles without fear of judgment.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-blue-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Encourage Toward Christ</h3>
                        <p className="text-gray-700">Build each other up. Challenge sin. Point one another to Jesus in every conversation.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-pink-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Protect Dignity</h3>
                        <p className="text-gray-700">Honor women, children, and families. Guard your heart and theirs. Flee temptation.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-6 h-6 text-yellow-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Address Conflict Gracefully</h3>
                        <p className="text-gray-700">Go directly to your brother. Seek reconciliation. Forgive as Christ forgave you.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Report Concerning Behavior</h3>
                        <p className="text-gray-700">If you witness abuse, threats, or dangerous behavior, report it to leaders immediately.</p>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <div className="mt-8 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300 rounded-xl p-8">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={covenantAgreed}
                        onChange={(e) => setCovenantAgreed(e.target.checked)}
                        className="mt-1.5 w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition block mb-2">
                          I understand and agree to this Code of Conduct
                        </span>
                        <p className="text-sm text-gray-600">
                          By checking this box, I commit to upholding these standards in all my interactions within the community.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                  <button
                    onClick={() => setPhase(5)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setPhase(7)}
                    disabled={!covenantAgreed}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                      covenantAgreed
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {!covenantAgreed ? 'Please agree to the Code of Conduct' : 'Continue to Review'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Phase 7: Join the Fellowship - Review */}
          {phase === 7 && (
            <div className="flex flex-col">
              <div className="py-12 px-4">
                {/* Header */}
                <div className="text-center mb-10">
                  <h1 className="text-3xl font-bold mb-2 text-gray-900">
                    Review Your Profile
                  </h1>
                  <p className="text-gray-600 text-base">Confirm your location and style before entering the line.</p>
                </div>

                {/* 2x2 Summary Manifest Grid */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Card 1: Identity & Location */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
                        <h3 className="text-lg font-bold text-gray-900">Identity & Location</h3>
                      </div>
                      <button
                        onClick={() => setPhase(1)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Display Name</div>
                        <div className="text-gray-900 font-semibold">{displayName}</div>
                      </div>
                      {bio.trim() && (
                        <div>
                          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Bio</div>
                          <div className="text-gray-700 text-sm leading-relaxed">{bio}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Located In</div>
                        <div className="text-gray-900 font-semibold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                          {[community, city, region].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: The Toolkit */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
                        <h3 className="text-lg font-bold text-gray-900">The Toolkit</h3>
                      </div>
                      <button
                        onClick={() => setPhase(2)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      {/* Steward Level - Expert (Level 3) */}
                      {selectedInterests.filter(si => si.proficiencyLevel === 3).length > 0 && (
                        <div>
                          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Steward Level</div>
                          <div className="text-gray-900 font-semibold">
                            {selectedInterests
                              .filter(si => si.proficiencyLevel === 3)
                              .map(si => interests.find(i => i.id === si.interestId)?.name)
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        </div>
                      )}
                      {/* Practitioner Level (Level 2) */}
                      {selectedInterests.filter(si => si.proficiencyLevel === 2).length > 0 && (
                        <div>
                          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Practitioner Level</div>
                          <div className="text-gray-900 font-semibold">
                            {selectedInterests
                              .filter(si => si.proficiencyLevel === 2)
                              .map(si => interests.find(i => i.id === si.interestId)?.name)
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        </div>
                      )}
                      {/* Learning - Novice (Level 1) */}
                      {selectedInterests.filter(si => si.proficiencyLevel === 1).length > 0 && (
                        <div>
                          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Learning</div>
                          <div className="text-gray-900 font-semibold">
                            {selectedInterests
                              .filter(si => si.proficiencyLevel === 1)
                              .map(si => interests.find(i => i.id === si.interestId)?.name)
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        </div>
                      )}
                      {selectedInterests.length === 0 && (
                        <div className="text-gray-500 text-sm italic">No skills selected</div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: The Archetype */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
                        <h3 className="text-lg font-bold text-gray-900">The Archetype</h3>
                      </div>
                      <button
                        onClick={() => setPhase(4)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Your Role</div>
                        <div className="text-gray-900 font-semibold">
                          {selectedArchetype ? archetypes.find(a => a.id === selectedArchetype)?.label : 'Not selected'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Focus</div>
                        <div className="text-gray-900 font-semibold">
                          {selectedArchetype ? archetypes.find(a => a.id === selectedArchetype)?.alignment : 'Not selected'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Connection Style */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Radio className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
                        <h3 className="text-lg font-bold text-gray-900">Connection Style</h3>
                      </div>
                      <button
                        onClick={() => setPhase(3)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Your Mode</div>
                        <div className="text-gray-900 font-semibold">
                          {operationalMode === 'workshop' ? 'Builders' :
                           operationalMode === 'fireside' ? 'The Fireside' :
                           operationalMode === 'outpost' ? 'Bridge' :
                           'Not selected'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Style</div>
                        <div className="text-gray-900 font-semibold">
                          {operationalMode === 'workshop' ? 'Shoulder-to-Shoulder' :
                           operationalMode === 'fireside' ? 'Face-to-Face' :
                           operationalMode === 'outpost' ? 'Digital-to-Digital' :
                           'Not selected'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Spiritual Foundation */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm col-span-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
                        <h3 className="text-lg font-bold text-gray-900">Spiritual Foundation</h3>
                      </div>
                      <button
                        onClick={() => setPhase(5)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-3 text-sm">
                      {churchAffiliation && (
                        <div>
                          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Church Affiliation</div>
                          <div className="text-gray-900 font-semibold capitalize">{churchAffiliation.replace('_', ' ')}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Growth Areas</div>
                        <div className="text-gray-900 font-semibold">
                          {spiritualGoals.map(goalId =>
                            spiritualGoalsOptions.find(g => g.id === goalId)?.label
                          ).filter(Boolean).join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-semibold text-gray-700">
                          Seeking Accountability: {accountabilityAreas.length} {accountabilityAreas.length === 1 ? 'area' : 'areas'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer - Deployment CTA */}
              <div className="p-4">
                <div className="max-w-4xl mx-auto">
                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white rounded-lg font-bold text-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Joining the Fellowship...
                      </span>
                    ) : (
                      'Join the Fellowship'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
