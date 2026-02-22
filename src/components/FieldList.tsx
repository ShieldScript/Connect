'use client';

import { useMemo } from 'react';
import { FellowCard } from './FellowCard';
import { CircleCard } from './CircleCard';

interface FieldListProps {
  persons: Array<{
    id: string;
    displayName: string;
    profileImageUrl: string | null;
    archetype?: string | null;
    interests?: { name: string; proficiencyLevel: number }[];
    distanceKm: number;
  }>;
  gatherings: Array<{
    id: string;
    name: string;
    type: string;
    currentSize: number;
    maxSize?: number | null;
    tags: string[];
    distanceKm: number;
    isVirtual: boolean;
    status: string;
    creatorName?: string;
  }>;
  activeTab: 'fellows' | 'circles';
  searchQuery: string;
  hoveredItemId: string | null;
  onCardHover: (id: string | null) => void;
  onFellowClick: (person: any) => void;
  onGatheringClick: (gathering: any) => void;
}

export function FieldList({
  persons,
  gatherings,
  activeTab,
  searchQuery,
  hoveredItemId,
  onCardHover,
  onFellowClick,
  onGatheringClick,
}: FieldListProps) {
  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items: Array<{ type: 'person' | 'gathering'; data: any }> = [];

    // Filter by active tab
    if (activeTab === 'fellows') {
      items.push(...persons.map((p) => ({ type: 'person' as const, data: p })));
    }
    if (activeTab === 'circles') {
      items.push(...gatherings.map((g) => ({ type: 'gathering' as const, data: g })));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter((item) => {
        if (item.type === 'person') {
          return item.data.displayName.toLowerCase().includes(query);
        } else {
          return (
            item.data.name.toLowerCase().includes(query) ||
            item.data.tags.some((tag: string) => tag.toLowerCase().includes(query))
          );
        }
      });
    }

    // Sort by distance
    items.sort((a, b) => a.data.distanceKm - b.data.distanceKm);

    return items;
  }, [persons, gatherings, activeTab, searchQuery]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      <div className="space-y-3 max-w-3xl mx-auto">
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? 'No results found. Try a different search term.'
                : activeTab === 'fellows'
                ? 'No brothers nearby. Try increasing the radius.'
                : 'No circles nearby. Try increasing the radius.'}
            </p>
          </div>
        )}

        {filteredItems.map((item) =>
          item.type === 'person' ? (
            <FellowCard
              key={item.data.id}
              person={item.data}
              isHovered={hoveredItemId === item.data.id}
              onHover={(hovered) => onCardHover(hovered ? item.data.id : null)}
              onClick={() => onFellowClick(item.data)}
            />
          ) : (
            <CircleCard
              key={item.data.id}
              gathering={item.data}
              isHovered={hoveredItemId === item.data.id}
              onHover={(hovered) => onCardHover(hovered ? item.data.id : null)}
              onClick={() => onGatheringClick(item.data)}
            />
          )
        )}
      </div>
    </div>
  );
}
