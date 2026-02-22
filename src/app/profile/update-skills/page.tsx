'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Hammer, Flame, Radio, Wrench, Shield, Check } from 'lucide-react';

interface Interest {
  id: string;
  name: string;
  category: string;
  metadata?: any;
}

interface InterestWithProficiency {
  interestId: string;
  proficiencyLevel: number; // 1-3: Beginner, Intermediate, Expert
}

// Category tabs with Biblical context
const categories = [
  { id: 'outdoor_adventure', label: 'Outdoor Adventure' },
  { id: 'craftsmanship_trades_maker', label: 'Craftsmanship & Trades' },
  { id: 'physicality_combat_team_sports', label: 'Physical & Sports' },
  { id: 'culinary_fire_food', label: 'Culinary & Food' },
  { id: 'strategy_mentorship_leadership', label: 'Strategy & Leadership' },
  { id: 'faith_formation_relational', label: 'Faith & Formation' },
  { id: 'service_civic_community', label: 'Service & Community' },
  { id: 'creative_cultural', label: 'Creative & Cultural' },
  { id: 'digital_tech', label: 'Digital & Tech' },
];

// Character Archetypes
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
];

// Phase Progress Component
function PhaseProgress({ phase }: { phase: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((p) => (
        <div
          key={p}
          className={`h-2.5 w-20 rounded-full transition-all duration-500 ${
            p <= phase ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        />
      ))}
      <span className="ml-3 text-base text-gray-600 font-semibold">Step {phase} of 3</span>
    </div>
  );
}

export default function UpdateSkillsPage() {
  const [phase, setPhase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Phase 1: Defining Stewardship (Interest Matrix)
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('outdoor_adventure');
  const [selectedInterests, setSelectedInterests] = useState<InterestWithProficiency[]>([]);
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Phase 2: Operational Mode
  const [operationalMode, setOperationalMode] = useState<string>('');

  // Phase 3: Archetype Alignment
  const [selectedArchetype, setSelectedArchetype] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch interests and current profile in parallel
        const [interestsRes, profileRes] = await Promise.all([
          fetch('/api/interests'),
          fetch('/api/persons/me')
        ]);

        if (!interestsRes.ok) throw new Error('Failed to fetch interests');
        if (!profileRes.ok) throw new Error('Failed to fetch profile');

        const interestsData = await interestsRes.json();
        const profileData = await profileRes.json();

        setInterests(interestsData.interests || []);

        // Pre-populate with current user data
        if (profileData.interests && profileData.interests.length > 0) {
          // Map user's current interests to the format we need
          // Load proficiency levels directly (1=Learner, 2=Practitioner, 3=Mentor)
          const currentInterests = profileData.interests.map((interest: any) => ({
            interestId: interest.id,
            proficiencyLevel: interest.proficiencyLevel,
          }));
          setSelectedInterests(currentInterests);
        }

        if (profileData.connectionStyle) {
          setOperationalMode(profileData.connectionStyle);
        }

        if (profileData.archetype) {
          setSelectedArchetype(profileData.archetype);
        }

        setLoadingProfile(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoadingInterests(false);
      }
    };

    fetchData();
  }, []);

  const setProficiencyLevel = (interestId: string, level: number) => {
    const existing = selectedInterests.find(si => si.interestId === interestId);

    if (existing) {
      setSelectedInterests(
        selectedInterests.map(si =>
          si.interestId === interestId
            ? { ...si, proficiencyLevel: level }
            : si
        )
      );
    } else {
      setSelectedInterests([
        ...selectedInterests,
        { interestId, proficiencyLevel: level }
      ]);
    }
  };

  const removeInterest = (interestId: string) => {
    setSelectedInterests(selectedInterests.filter(si => si.interestId !== interestId));
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setTimeout(() => {
      categoryRefs.current[categoryId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }, 0);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        interests: selectedInterests.map(si => ({
          interestId: si.interestId,
          proficiencyLevel: si.proficiencyLevel, // Save 1-3 directly (1=Learner, 2=Practitioner, 3=Mentor)
        })),
      };

      // Only include archetype if it's set
      if (selectedArchetype) {
        payload.archetype = selectedArchetype;
      }

      // Only include connectionStyle if it's set
      if (operationalMode) {
        payload.connectionStyle = operationalMode;
      }

      console.log('📤 Updating profile:', payload);

      const res = await fetch('/api/persons/me/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Update failed');
      }

      // Navigate to profile - force-dynamic setting will ensure fresh data
      router.push('/profile');
    } catch (err: any) {
      console.error('Update failed:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredInterests = interests.filter(i => i.category === selectedCategory);

  // Calculate suggested archetypes based on selected interests
  const getSuggestedArchetypes = (): string[] => {
    // Try mentor level first, then fall back to all interests
    let categoriesToConsider = selectedInterests
      .filter(si => si.proficiencyLevel === 3)
      .map(si => {
        const interest = interests.find(i => i.id === si.interestId);
        return interest?.category;
      });

    // If no mentor areas, use all selected interests
    if (categoriesToConsider.length === 0) {
      categoriesToConsider = selectedInterests.map(si => {
        const interest = interests.find(i => i.id === si.interestId);
        return interest?.category;
      });
    }

    const suggestions: string[] = [];

    // Map categories to archetypes
    if (categoriesToConsider.includes('faith_formation_relational') || categoriesToConsider.includes('strategy_mentorship_leadership')) {
      suggestions.push('sage', 'encourager');
    }
    if (categoriesToConsider.includes('craftsmanship_trades_maker') || categoriesToConsider.includes('creative_cultural')) {
      suggestions.push('builder', 'artisan');
    }
    if (categoriesToConsider.includes('physicality_combat_team_sports') || categoriesToConsider.includes('outdoor_adventure')) {
      suggestions.push('guardian', 'scout');
    }
    if (categoriesToConsider.includes('culinary_fire_food') || categoriesToConsider.includes('service_civic_community')) {
      suggestions.push('provider', 'steward');
    }
    if (categoriesToConsider.includes('strategy_mentorship_leadership')) {
      suggestions.push('navigator', 'architect');
    }

    // Remove duplicates and limit to top 3
    return [...new Set(suggestions)].slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto p-6">
        <PhaseProgress phase={phase} />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Phase 1: Defining Stewardship - EXPANDING GRID CARDS */}
        {phase === 1 && (
          <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="sticky top-0 bg-gray-50 z-20 pb-4 border-b border-gray-200">
              <div className="text-center mb-5">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                  Update Your Stewardship
                </h1>
                <p className="text-gray-600 text-base">Select areas where you'd like to connect ({selectedInterests.length} selected)</p>
              </div>

              <div className="relative -mx-1">
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10"></div>

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

            <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {(loadingInterests || loadingProfile) ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredInterests.map((interest) => {
                    const selected = selectedInterests.find(si => si.interestId === interest.id);
                    const isMentor = selected?.proficiencyLevel === 3;

                    return (
                      <div
                        key={interest.id}
                        className={`relative rounded-xl transition-all duration-300 min-h-[140px] flex flex-col ${
                          isMentor
                            ? 'border-2 border-amber-500 bg-amber-50 shadow-lg border-t-4'
                            : selected
                            ? 'border-2 border-blue-600 bg-blue-50 shadow-md'
                            : 'border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        <div className="p-4 flex-1 flex flex-col">
                          {!selected && (
                            <button
                              onClick={() => setProficiencyLevel(interest.id, 1)}
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

                          {selected && (
                            <div className="h-full flex flex-col">
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
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 p-4 z-20">
              <div className="max-w-5xl mx-auto flex items-center gap-4">
                <button
                  onClick={() => router.push('/profile')}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
                >
                  ← Cancel
                </button>
                <button
                  onClick={() => setPhase(2)}
                  className="flex-1 py-4 rounded-lg font-bold text-lg transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Connection Style */}
        {phase === 2 && (
          <div className="flex flex-col">
            {loadingProfile ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                How Do You Connect Best?
              </h1>
              <p className="text-gray-600 text-base">Choose your preferred style of fellowship</p>
            </div>

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

            <div className="p-4">
              <div className="max-w-3xl mx-auto flex items-center gap-4">
                <button
                  onClick={() => setPhase(1)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setPhase(3)}
                  className="flex-1 py-4 rounded-lg font-bold text-lg transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
                >
                  Continue
                </button>
              </div>
            </div>
              </>
            )}
          </div>
        )}

        {/* Phase 3: Archetype Alignment */}
        {phase === 3 && (
          <div className="flex flex-col h-[calc(100vh-120px)]">
            {loadingProfile ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                Which Role Resonates With You?
              </h1>
              <p className="text-gray-600 text-base">This helps us match you with like-minded people</p>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent pointer-events-none z-10"></div>

              <div className="h-full overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* SPOTLIGHT SECTION - Your Best Fit */}
                {getSuggestedArchetypes().length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Your Best Fit</h2>
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Recommended</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getSuggestedArchetypes().map((archetypeId) => {
                        const archetype = archetypes.find(a => a.id === archetypeId);
                        if (!archetype) return null;

                        const isSelected = selectedArchetype === archetype.id;

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
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ALL ROLES SECTION */}
                <div className="pb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">All Roles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {archetypes
                      .filter(a => !getSuggestedArchetypes().includes(a.id))
                      .map((archetype) => {
                        const isSelected = selectedArchetype === archetype.id;

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
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 p-4 z-20">
              <div className="max-w-5xl mx-auto flex items-center gap-4">
                <button
                  onClick={() => setPhase(2)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-semibold transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                    !loading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
