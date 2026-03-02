'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PersonWithRelations, InterestWithProficiency } from '@/types';
import { SkillsSection } from './profile/SkillsSection';
import { LocationSection } from './profile/LocationSection';
import { ConnectionStyleSection } from './profile/ConnectionStyleSection';
import { SecuritySection } from './profile/SecuritySection';
import HexacoInsightsCard from './profile/HexacoInsightsCard';
import DNARevealCard from './onboarding/DNARevealCard';

interface ProfileClientProps {
  person: PersonWithRelations;
  interests: InterestWithProficiency[];
}

export function ProfileClient({ person, interests }: ProfileClientProps) {
  const router = useRouter();
  const [signalStatus, setSignalStatus] = useState<'active' | 'muted'>('active');
  const [searchRadius, setSearchRadius] = useState(person.proximityRadiusKm || 5);
  const [community, setCommunity] = useState(person.community || '');
  const [city, setCity] = useState(person.city || '');
  const [region, setRegion] = useState(person.region || '');
  const [connectionStyle, setConnectionStyle] = useState(person.connectionStyle || 'builders');
  const [bio, setBio] = useState(person.bio || '');
  const [howToConnect, setHowToConnect] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hexacoInsights, setHexacoInsights] = useState(person.hexacoInsights || null);
  const [dnaAnalysis, setDnaAnalysis] = useState<any | null>(null);
  const [isLoadingDNA, setIsLoadingDNA] = useState(false);

  // Edit mode states for each section
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingConnection, setIsEditingConnection] = useState(false);
  const [isEditingHowToConnect, setIsEditingHowToConnect] = useState(false);

  // Sync local state with person prop when it changes
  useEffect(() => {
    console.log('Person bio from database:', person.bio);
    setSearchRadius(person.proximityRadiusKm || 5);
    setCommunity(person.community || '');
    setCity(person.city || '');
    setRegion(person.region || '');
    setConnectionStyle(person.connectionStyle || 'builders');
    setBio(person.bio || '');
    setHowToConnect('');
  }, [person]);

  // Fetch DNA analysis if HEXACO is complete
  useEffect(() => {
    const fetchDNAAnalysis = async () => {
      if (person.hexacoScores && person.hexacoArchetype) {
        setIsLoadingDNA(true);
        try {
          const res = await fetch('/api/ai/dna-analysis', {
            method: 'POST',
          });
          if (res.ok) {
            const data = await res.json();
            setDnaAnalysis(data.data);
          }
        } catch (error) {
          console.error('Failed to fetch DNA analysis:', error);
        } finally {
          setIsLoadingDNA(false);
        }
      }
    };

    fetchDNAAnalysis();
  }, [person.hexacoScores, person.hexacoArchetype]);

  // Track if changes have been made
  const hasChanges =
    searchRadius !== (person.proximityRadiusKm || 5) ||
    community !== (person.community || '') ||
    city !== (person.city || '') ||
    region !== (person.region || '') ||
    connectionStyle !== (person.connectionStyle || 'builders') ||
    bio !== (person.bio || '') ||
    howToConnect !== '';

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Build payload
      const payload: Record<string, any> = {
        proximityRadiusKm: searchRadius,
      };

      if (community) payload.community = community;
      if (city) payload.city = city;
      if (region) payload.region = region;
      if (connectionStyle) payload.connectionStyle = connectionStyle;
      if (bio) payload.bio = bio;

      const res = await fetch('/api/persons/me/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Failed to save changes');
      }

      setSaveSuccess(true);
      router.refresh();

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Failed to save profile changes:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions
  const formatArchetype = (name: string | null): string => {
    if (!name) return 'Active Member';
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    return `The ${formatted}`;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">My Profile</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Your Information</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">SIGNAL:</span>
          <button
            onClick={() => setSignalStatus(signalStatus === 'active' ? 'muted' : 'active')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition border ${
              signalStatus === 'active'
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-gray-100 text-gray-500 border-gray-300'
            }`}
          >
            <span className={signalStatus === 'active' ? 'text-green-500' : 'text-gray-400'}>●</span>
            {signalStatus.toUpperCase()}
          </button>
        </div>
      </div>

      {/* User Spec Card */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">{getInitials(person.displayName)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {person.displayName}
            </h2>
            <p className="text-base text-gray-700 font-semibold">{formatArchetype(person.archetype)}</p>
          </div>
        </div>

        {/* Bio Inner Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              ABOUT YOU
            </h3>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {isEditingBio ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditingBio ? (
            <div className="relative bg-gray-50 px-4 py-4 pb-2 rounded-lg">
              <textarea
                id="bio-edit"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder=" "
                rows={3}
                className="peer w-full text-base px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors bg-transparent placeholder-transparent resize-none"
                maxLength={200}
              />
              <label htmlFor="bio-edit" className="absolute left-4 top-1 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-6 peer-focus:top-1 peer-focus:text-gray-600 peer-focus:text-sm cursor-text">
                Tell the brothers about yourself
              </label>
              <div className="text-right mt-1">
                <span className={`text-xs ${bio.length > 180 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {bio.length}/200
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 leading-relaxed">
              {bio || <span className="text-gray-400 italic">No bio added yet. Click Edit to add one.</span>}
            </div>
          )}
        </div>
      </section>

      {/* HEXACO Insights */}
      {hexacoInsights && (
        <HexacoInsightsCard
          insights={hexacoInsights}
          archetype={person.hexacoArchetype || null}
          onRegenerate={async () => {
            const res = await fetch('/api/ai/hexaco-insights', {
              method: 'POST',
            });
            if (res.ok) {
              const data = await res.json();
              setHexacoInsights(data.data.insights);
              router.refresh();
            }
          }}
        />
      )}

      {/* DNA Reveal - Full Analysis */}
      {person.hexacoScores && person.hexacoArchetype && (
        <DNARevealCard
          hexacoScores={person.hexacoScores as any}
          archetype={person.hexacoArchetype}
          analysis={dnaAnalysis}
          isLoading={isLoadingDNA}
        />
      )}

      {/* Skills Section */}
      <SkillsSection interests={interests} />

      {/* Location Section */}
      <LocationSection
        community={community}
        city={city}
        region={region}
        searchRadius={searchRadius}
        isEditing={isEditingLocation}
        onEditToggle={() => setIsEditingLocation(!isEditingLocation)}
        onCommunityChange={setCommunity}
        onCityChange={setCity}
        onRegionChange={setRegion}
        onSearchRadiusChange={setSearchRadius}
      />

      {/* Connection Style & How to Connect */}
      <ConnectionStyleSection
        connectionStyle={connectionStyle}
        howToConnect={howToConnect}
        isEditingStyle={isEditingConnection}
        isEditingHowTo={isEditingHowToConnect}
        onEditStyleToggle={() => setIsEditingConnection(!isEditingConnection)}
        onEditHowToToggle={() => setIsEditingHowToConnect(!isEditingHowToConnect)}
        onConnectionStyleChange={setConnectionStyle}
        onHowToConnectChange={setHowToConnect}
      />

      {/* Save Changes Button */}
      {hasChanges && (
        <div className="sticky bottom-6 z-10">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-4">
              {saveError && (
                <p className="text-sm text-red-600 flex-1">{saveError}</p>
              )}
              {saveSuccess && (
                <p className="text-sm text-green-600 flex-1 font-medium">✓ Changes saved successfully</p>
              )}
              {!saveError && !saveSuccess && (
                <p className="text-sm text-gray-600 flex-1">You have unsaved changes</p>
              )}
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  isSaving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Section */}
      <SecuritySection />
    </div>
  );
}
