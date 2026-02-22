'use client';

import { useState, useEffect } from 'react';
import { DiscoveryHeader } from '@/components/DiscoveryHeader';
import { FieldList } from '@/components/FieldList';
import { ProtocolModal } from '@/components/ProtocolModal';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Lazy-load map to avoid SSR issues with Leaflet
const FieldMap = dynamic(() => import('@/components/FieldMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading map...</p>
    </div>
  ),
});

interface TheFieldClientProps {
  personId: string;
  userLocation: { lat: number; lng: number };
}

export default function TheFieldClient({ personId, userLocation }: TheFieldClientProps) {
  const [selectedRadius, setSelectedRadius] = useState(5);
  const [activeTab, setActiveTab] = useState<'fellows' | 'circles'>('fellows');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [selectedFellow, setSelectedFellow] = useState<any>(null);

  const [persons, setPersons] = useState<any[]>([]);
  const [gatherings, setGatherings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount and when radius changes
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [personsRes, gatheringsRes] = await Promise.all([
          fetch(
            `/api/persons/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${selectedRadius}&limit=50`
          ),
          fetch(
            `/api/groups/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${selectedRadius}&limit=50`
          ),
        ]);

        if (!personsRes.ok || !gatheringsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const personsData = await personsRes.json();
        const gatheringsData = await gatheringsRes.json();

        setPersons(personsData.persons || []);
        setGatherings(gatheringsData.groups || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load nearby fellows and gatherings');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedRadius, userLocation]);

  // Handle fellow click - open protocol modal
  const handleFellowClick = (person: any) => {
    // Transform person data to match ProtocolModal interface
    const fellowData = {
      name: person.displayName,
      archetype: person.archetype || 'Fellow',
      skills: person.interests
        ? person.interests.map((i: any) => ({
            name: i.name,
            level: i.proficiencyLevel,
          }))
        : [],
      bio: person.bio || undefined,
      distance: person.distanceKm,
      contactMethods: undefined, // TODO: Add contact methods when available
      availability: undefined,
      connectionStyle: person.connectionStyle || undefined,
    };
    setSelectedFellow(fellowData);
  };

  // Handle gathering click - TODO: Implement gathering detail page/modal
  const handleGatheringClick = (gathering: any) => {
    console.log('Gathering clicked:', gathering);
    // TODO: Navigate to gathering detail page or open GatheringModal
  };

  return (
    <main className="h-screen flex flex-col bg-white">
      {/* Global Header */}
      <DiscoveryHeader
        selectedRadius={selectedRadius}
        onRadiusChange={setSelectedRadius}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        fellowCount={persons.length}
        circleCount={gatherings.length}
      />

      {/* Split Screen: Map (60%) + List (40%) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading The Field...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <>
            {/* Map Section (Top 60%) */}
            <div className="h-[60%] border-b border-gray-200">
              <FieldMap
                persons={persons}
                gatherings={gatherings.filter((g) => !g.isVirtual)} // Exclude digital stations
                userLat={userLocation.lat}
                userLng={userLocation.lng}
                hoveredItemId={hoveredItemId}
                onPinHover={setHoveredItemId}
                onPinClick={(id) => {
                  // Find person or gathering by ID and handle click
                  const person = persons.find((p) => p.id === id);
                  const gathering = gatherings.find((g) => g.id === id);
                  if (person) handleFellowClick(person);
                  if (gathering) handleGatheringClick(gathering);
                }}
              />
            </div>

            {/* Discovery Spill (Bottom 40%) */}
            <div className="h-[40%] overflow-hidden">
              <FieldList
                persons={persons}
                gatherings={gatherings} // Include all gatherings (digital shown in list only)
                activeTab={activeTab}
                searchQuery={searchQuery}
                hoveredItemId={hoveredItemId}
                onCardHover={setHoveredItemId}
                onFellowClick={handleFellowClick}
                onGatheringClick={handleGatheringClick}
              />
            </div>
          </>
        )}
      </div>

      {/* Protocol Modal */}
      {selectedFellow && (
        <ProtocolModal
          fellow={selectedFellow}
          onClose={() => setSelectedFellow(null)}
        />
      )}
    </main>
  );
}
