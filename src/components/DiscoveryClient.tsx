'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DiscoveryHeader } from '@/components/DiscoveryHeader';
import { DiscoveryFeed } from '@/components/DiscoveryFeed';
import { PersonMatchResult, GroupWithRelations } from '@/types';
import { useDiscoveryData } from '@/hooks/useDiscoveryData';

// Load map only on client-side to avoid SSR issues with Leaflet
const RadialCompassMapCartoDB = dynamic(
  () => import('@/components/RadialCompassMapCartoDB').then(mod => mod.RadialCompassMapCartoDB),
  { ssr: false }
);

interface DiscoveryClientProps {
  personId: string;
  userLocation: { lat: number; lng: number };
  savedRadius?: number;
  userStation?: string;
}

type IntelTab = 'fellows' | 'circles';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DiscoveryClient({
  personId,
  userLocation,
  savedRadius = 5,
  userStation
}: DiscoveryClientProps) {
  const searchParams = useSearchParams();
  const [selectedRadius, setSelectedRadius] = useState(savedRadius);
  const [activeTab, setActiveTab] = useState<IntelTab>('fellows');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editCircleId, setEditCircleId] = useState<string | null>(null);

  // Use the custom hook for data fetching
  const {
    persons,
    physicalGatherings,
    digitalGatherings,
    isLoading,
    error,
    refetch,
    setGatherings,
  } = useDiscoveryData({ userLocation, selectedRadius });

  // DEBUG: Log raw data from hook
  useEffect(() => {
    console.log('🔍 DiscoveryClient - Raw data from hook:', {
      personsCount: persons.length,
      personsWithPerson: persons.filter(m => m && m.person != null).length,
      physicalGatheringsCount: physicalGatherings.length,
      digitalGatheringsCount: digitalGatherings.length,
      firstPerson: persons[0],
      firstGathering: physicalGatherings[0],
    });
  }, [persons, physicalGatherings, digitalGatherings]);

  // Check for edit query parameter on mount
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      fetch(`/api/groups/${editId}`)
        .then(res => res.json())
        .then(data => {
          setGatherings(prev => {
            const exists = prev.some(g => g.id === editId);
            if (!exists && data.group) {
              return [...prev, data.group];
            }
            return prev;
          });
          setEditCircleId(editId);
          setActiveTab('circles');
        })
        .catch(err => console.error('Failed to fetch circle for edit:', err));
    }
  }, [searchParams, setGatherings]);

  // Save radius to database when it changes
  const handleRadiusChange = async (newRadius: number) => {
    setSelectedRadius(newRadius);

    try {
      await fetch('/api/persons/me/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proximityRadiusKm: newRadius }),
      });
    } catch (err) {
      console.error('Failed to save radius preference:', err);
    }
  };

  // Event handlers
  const handleFellowClick = (person: any) => {
    // Handle both PersonMatchResult (from /api/matches/persons) and nearby persons
    const personId = person.person?.id || person.id;
    setSelectedItemId(personId);
    // Clear selection after a brief moment to remove highlight
    setTimeout(() => setSelectedItemId(null), 100);
  };

  const handleCircleClick = (circle: GroupWithRelations) => {
    setSelectedItemId(circle.id);
    // Clear selection after a brief moment to remove highlight
    setTimeout(() => setSelectedItemId(null), 100);
  };

  const handlePinClick = (id: string, type: 'person' | 'circle') => {
    setSelectedItemId(id);
    setActiveTab(type === 'person' ? 'fellows' : 'circles');

    setTimeout(() => {
      const element = document.getElementById(`intel-item-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <main className="h-screen flex flex-col bg-white">
      {/* Global Header */}
      <DiscoveryHeader
        selectedRadius={selectedRadius}
        onRadiusChange={handleRadiusChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        fellowCount={persons.length}
        circleCount={physicalGatherings.length + digitalGatherings.length}
      />

      {/* Tactical Command Split: Intelligence Feed + Compass */}
      <div className="flex-1 flex overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Finding brothers nearby...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <p className="text-red-600 text-sm mb-2">{error}</p>
              <button
                onClick={refetch}
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
            {/* LEFT: Intelligence Feed (40%) */}
            <div className="w-[40%] flex flex-col border-r border-gray-200 bg-white">
              <DiscoveryFeed
                activeTab={activeTab}
                onTabChange={setActiveTab}
                persons={persons}
                physicalGatherings={physicalGatherings}
                digitalGatherings={digitalGatherings}
                searchQuery={searchQuery}
                hoveredItemId={hoveredItemId}
                selectedItemId={selectedItemId}
                onCardHover={setHoveredItemId}
                onFellowClick={handleFellowClick}
                onCircleClick={handleCircleClick}
                userLat={userLocation.lat}
                userLng={userLocation.lng}
                userStation={userStation}
                currentUserId={personId}
                onCircleCreated={refetch}
                editCircleId={editCircleId}
                onEditComplete={() => setEditCircleId(null)}
              />
            </div>

            {/* RIGHT: Radial Compass (60%) */}
            <div className="flex-1 relative bg-white">
              <RadialCompassMapCartoDB
                radiusKm={selectedRadius}
                userLat={userLocation.lat}
                userLng={userLocation.lng}
                persons={(() => {
                  const mappedPersons = persons
                    .filter(m => m && m.person != null)
                    .map(m => ({
                      id: m.person.id,
                      displayName: m.person.displayName,
                      location: m.person.latitude && m.person.longitude
                        ? { latitude: m.person.latitude, longitude: m.person.longitude }
                        : null,
                      distanceKm: m.person.latitude && m.person.longitude
                        ? calculateDistance(userLocation.lat, userLocation.lng, m.person.latitude, m.person.longitude)
                        : 0,
                      archetype: m.person.archetype || undefined,
                      interests: m.person.interests?.map((pi: any) => ({
                        name: pi.interest?.name || pi.name,
                        proficiencyLevel: pi.proficiencyLevel,
                      })) || [],
                      bio: m.person.bio || undefined,
                      connectionProtocol: m.person.connectionStyle || undefined,
                    }));
                  console.log('📍 Persons being sent to map:', {
                    total: mappedPersons.length,
                    withLocation: mappedPersons.filter(p => p.location?.latitude && p.location?.longitude).length,
                    firstPerson: mappedPersons[0],
                  });
                  return mappedPersons;
                })()}
                circles={(() => {
                  const mappedCircles = physicalGatherings.map(g => ({
                    id: g.id,
                    name: g.name,
                    type: g.type,
                    latitude: g.latitude,
                    longitude: g.longitude,
                    distanceKm: g.latitude && g.longitude
                      ? calculateDistance(userLocation.lat, userLocation.lng, g.latitude, g.longitude)
                      : 0,
                    currentSize: g.currentSize,
                    maxSize: g.maxSize,
                    description: g.description,
                    protocol: g.protocol,
                    tags: g.tags,
                    creatorName: g.creator?.displayName,
                    createdBy: g.createdBy,
                  }));
                  console.log('📍 Circles being sent to map:', {
                    total: mappedCircles.length,
                    withLocation: mappedCircles.filter(c => c.latitude && c.longitude).length,
                    firstCircle: mappedCircles[0],
                  });
                  return mappedCircles;
                })()}
                hoveredItemId={hoveredItemId}
                selectedItemId={selectedItemId}
                onPinHover={setHoveredItemId}
                onPinClick={handlePinClick}
                currentUserId={personId}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
