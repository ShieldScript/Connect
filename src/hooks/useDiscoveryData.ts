import { useState, useEffect } from 'react';
import { PersonMatchResult, GroupWithRelations } from '@/types';

interface UseDiscoveryDataOptions {
  userLocation: { lat: number; lng: number };
  selectedRadius: number;
}

export function useDiscoveryData({ userLocation, selectedRadius }: UseDiscoveryDataOptions) {
  const [persons, setPersons] = useState<PersonMatchResult[]>([]);
  const [gatherings, setGatherings] = useState<GroupWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const fetchData = async () => {
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
      setError('Failed to find brothers nearby');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when radius or location changes
  useEffect(() => {
    fetchData();
  }, [selectedRadius, userLocation.lat, userLocation.lng]);

  // Separate digital from physical gatherings
  const physicalGatherings = gatherings.filter((g) => !g.isVirtual);
  const digitalGatherings = gatherings.filter((g) => g.isVirtual);

  return {
    persons,
    gatherings,
    physicalGatherings,
    digitalGatherings,
    isLoading,
    error,
    refetch: fetchData,
    setGatherings, // Exposed for edit gathering functionality
  };
}
