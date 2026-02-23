'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Map, Hammer, Shield, Compass, BookOpen, Eye, Wrench, ArrowRight, ChevronDown, Heart, Sparkles, Tent, Laugh, HandHeart, Crown, Users, Lightbulb, Palette } from 'lucide-react';
import { ProtocolModal } from './ProtocolModal';
import toast from 'react-hot-toast';

interface Fellow {
  id: string;
  name: string;
  archetype: string;
  skills: { name: string; level: number }[];
  mode?: string;
  bio?: string;
  distance?: number;
  contactMethods?: {
    email?: string;
    phone?: string;
    signal?: string;
    whatsapp?: string;
  };
  availability?: string;
  connectionStyle?: string;
}

interface FellowsSectionProps {
  station: string;
  currentUserLat: number;
  currentUserLng: number;
  savedRadius?: number;
}

export function FellowsSection({ station, currentUserLat, currentUserLng, savedRadius = 5 }: FellowsSectionProps) {
  const [radiusMenuOpen, setRadiusMenuOpen] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(savedRadius);
  const [isSavingRadius, setIsSavingRadius] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFellow, setSelectedFellow] = useState<Fellow | null>(null);
  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch nearby fellows from API
  useEffect(() => {
    async function fetchFellows() {
      setIsLoading(true);
      setIsScanning(true);
      try {
        const response = await fetch(
          `/api/persons/nearby?lat=${currentUserLat}&lng=${currentUserLng}&radius=${selectedRadius}&limit=50`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch nearby persons');
        }

        const data = await response.json();

        // Transform API data to Fellow format
        const transformedFellows: Fellow[] = data.persons.map((person: any) => ({
          id: person.id,
          name: person.displayName,
          archetype: person.archetype || 'Member',
          skills: (person.interests || []).map((pi: any) => ({
            name: pi.interest?.name || pi.name,
            level: pi.proficiencyLevel || pi.level
          })),
          bio: person.bio,
          distance: person.distanceKm,
          connectionStyle: person.connectionStyle,
        }));

        setFellows(transformedFellows);
      } catch (error) {
        console.error('Error fetching nearby fellows:', error);
        setFellows([]);
      } finally {
        setIsLoading(false);
        setIsScanning(false);
      }
    }

    fetchFellows();
  }, [selectedRadius, currentUserLat, currentUserLng]);

  const allFellows = fellows;

  const handleRadiusChange = async (radius: number) => {
    const previousRadius = selectedRadius;
    setIsSavingRadius(true);
    setSelectedRadius(radius);
    setRadiusMenuOpen(false);

    // Save to database
    try {
      const response = await fetch('/api/persons/me/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proximityRadiusKm: radius,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save radius');
      }

      toast.success(`Search radius updated to ${radius}km`);
    } catch (err) {
      console.error('Failed to save radius preference:', err);
      toast.error('Failed to save radius preference');
      // Rollback on error
      setSelectedRadius(previousRadius);
    } finally {
      setIsSavingRadius(false);
    }
  };

  // Show first 4 brothers in horizontal scroll (Proximity Filter: focused, intentional connections)
  const visibleFellows = allFellows.slice(0, 4);

  // Helper: Get archetype icon with unique icons per archetype
  const getArchetypeIcon = (archetype: string) => {
    const archetypeLower = archetype.toLowerCase();

    // Wisdom & Knowledge
    if (archetypeLower.includes('sage')) return <BookOpen className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;

    // Craft & Creation
    if (archetypeLower.includes('builder')) return <Hammer className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('artisan')) return <Palette className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('architect')) return <Lightbulb className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;

    // Protection & Service
    if (archetypeLower.includes('guardian') || archetypeLower.includes('warrior') || archetypeLower.includes('watchman'))
      return <Shield className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('steward')) return <Wrench className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('caregiver') || archetypeLower.includes('provider'))
      return <HandHeart className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;

    // Leadership & Direction
    if (archetypeLower.includes('ruler')) return <Crown className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('navigator') || archetypeLower.includes('guide'))
      return <Compass className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;

    // Exploration & Adventure
    if (archetypeLower.includes('scout') || archetypeLower.includes('explorer'))
      return <Tent className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;

    // Relationships & Connection
    if (archetypeLower.includes('lover') || archetypeLower.includes('encourager'))
      return <Heart className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;

    // Transformation & Joy
    if (archetypeLower.includes('magician')) return <Sparkles className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('jester')) return <Laugh className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;

    // Default
    return <Users className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />;
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Brothers Nearby</h2>
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-3 min-w-[280px] max-w-[320px] animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Empty state
  if (allFellows.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Brothers Nearby</h2>
            <span className="text-sm text-gray-500">(0)</span>
          </div>
        </div>
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Map className="w-8 h-8 text-gray-400" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">No Brothers Yet</h3>
            <div className="text-gray-600 mb-6 leading-relaxed space-y-2">
              <p>You are the first Sentinel in this field.</p>
              <p>
                The fellowship is growing in{' '}
                <span className="font-semibold text-gray-900">{station}</span>. Check back soon.
              </p>
              <p>Try expanding your radius to connect with brothers further out.</p>
            </div>

            <div className="space-y-3">
              {/* Primary Action: Expand Radius */}
              <div className="relative">
                <button
                  onClick={() => setRadiusMenuOpen(!radiusMenuOpen)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Expand Radius ({selectedRadius}km → {selectedRadius === 5 ? '10km' : selectedRadius === 10 ? '25km' : '50km'})
                  <ChevronDown className="w-4 h-4" strokeWidth={2} />
                </button>

                {/* Dropdown Menu */}
                {radiusMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setRadiusMenuOpen(false)}
                    />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                      {[10, 25, 50].map((radius) => (
                        <button
                          key={radius}
                          onClick={() => handleRadiusChange(radius)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition text-gray-700"
                        >
                          {radius}km radius
                        </button>
                      ))}
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={() => handleRadiusChange(999)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition text-gray-700"
                      >
                        Global search
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Secondary Action: Create Group (Optional) */}
              <p className="text-xs text-gray-500">
                Or, if you'd like to gather brothers in your area,{' '}
                <Link href="/groups/create" className="text-blue-600 font-semibold hover:underline">
                  start a group
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Brothers Nearby</h2>
          <span className="text-sm text-gray-500">({allFellows.length})</span>

          {/* Radius Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setRadiusMenuOpen(!radiusMenuOpen)}
              disabled={isSavingRadius || isScanning}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-semibold text-gray-700 transition border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingRadius ? 'Saving...' : isScanning ? 'Scanning...' : `${selectedRadius}km`}
              <ChevronDown className="w-3 h-3" strokeWidth={2} />
            </button>

            {/* Dropdown Menu */}
            {radiusMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setRadiusMenuOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[100px]">
                  {[5, 10, 25, 50].map((radius) => (
                    <button
                      key={radius}
                      onClick={() => handleRadiusChange(radius)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition ${
                        selectedRadius === radius ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'
                      }`}
                    >
                      {radius}km
                    </button>
                  ))}
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => handleRadiusChange(999)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition ${
                      selectedRadius === 999 ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    Global
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <Link
          href="/groups"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          View All Brothers
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {visibleFellows.map((fellow, idx) => {
          const initials = fellow.name.split(' ').map(n => n[0]).join('').toUpperCase();

          return (
            <button
              key={idx}
              onClick={() => setSelectedFellow(fellow)}
              className="bg-white border-2 border-indigo-200 rounded-lg p-4 hover:border-indigo-400 hover:shadow-md transition flex-shrink-0 w-72 group focus:outline-none"
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-700 flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      {fellow.name}
                    </h3>
                    {/* Distance - aligned to the right */}
                    {fellow.distance !== undefined && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {fellow.distance.toFixed(1)}km
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    {getArchetypeIcon(fellow.archetype)}
                    <span className="uppercase tracking-wide">{fellow.archetype}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Protocol Modal */}
      {selectedFellow && (
        <ProtocolModal
          fellow={selectedFellow}
          onClose={() => setSelectedFellow(null)}
        />
      )}
    </section>
  );
}
