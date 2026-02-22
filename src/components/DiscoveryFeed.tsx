'use client';

import { useMemo, useState, useEffect } from 'react';
import { Plus, Shield } from 'lucide-react';
import { MiniPillCard } from './MiniPillCard';
import { CirclePillCard } from './CirclePillCard';
import { CreateCircleForm } from './CreateCircleForm';
import { ManageCircleForm } from './ManageCircleForm';
import { PersonMatchResult, GroupWithRelations } from '@/types';

type CircleFilter = 'all' | 'nearby' | 'online';

interface DiscoveryFeedProps {
  activeTab: 'fellows' | 'circles';
  onTabChange: (tab: 'fellows' | 'circles') => void;
  persons: any[]; // Supports both PersonMatchResult and nearby persons
  physicalGatherings: GroupWithRelations[];
  digitalGatherings: GroupWithRelations[];
  searchQuery: string;
  hoveredItemId: string | null;
  selectedItemId: string | null;
  onCardHover: (id: string | null) => void;
  onFellowClick: (person: PersonMatchResult) => void;
  onCircleClick: (circle: GroupWithRelations) => void;
  userLat: number;
  userLng: number;
  userStation?: string;
  currentUserId: string;
  onCircleCreated?: () => void;
  editCircleId?: string | null;
  onEditComplete?: () => void;
}

export function DiscoveryFeed({
  activeTab,
  onTabChange,
  persons,
  physicalGatherings,
  digitalGatherings,
  searchQuery,
  hoveredItemId,
  selectedItemId,
  onCardHover,
  onFellowClick,
  onCircleClick,
  userLat,
  userLng,
  userStation,
  currentUserId,
  onCircleCreated,
  editCircleId,
  onEditComplete,
}: DiscoveryFeedProps) {
  // Circles filter state (All, Nearby, Online)
  const [circleFilter, setCircleFilter] = useState<CircleFilter>('all');
  // Create mode state
  const [isCreating, setIsCreating] = useState(false);
  // Manage mode state
  const [managingCircle, setManagingCircle] = useState<any>(null);
  // Expanded person state (ID of expanded person)
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);
  // Expanded circle state (ID of expanded circle)
  const [expandedCircleId, setExpandedCircleId] = useState<string | null>(null);

  // Unified circles stream (Physical + Digital merged)
  const allCircles = useMemo(() => {
    return [...physicalGatherings, ...digitalGatherings];
  }, [physicalGatherings, digitalGatherings]);

  // Handle edit mode from query parameter
  useEffect(() => {
    if (editCircleId) {
      // Find the circle to edit
      const circleToEdit = allCircles.find(g => g.id === editCircleId);
      if (circleToEdit) {
        setManagingCircle(circleToEdit);
      }
    }
  }, [editCircleId, allCircles]);

  // Filter based on search query
  const filteredPersons = useMemo(() => {
    if (!searchQuery) return persons;
    const query = searchQuery.toLowerCase();
    return persons.filter((p) => {
      const displayName = p.person?.displayName || p.displayName || '';
      return displayName.toLowerCase().includes(query);
    });
  }, [persons, searchQuery]);

  const filteredCircles = useMemo(() => {
    let circles = allCircles;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      circles = circles.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Apply circle type filter (All, Nearby, Online)
    // Note: Huddles are managed separately and not fetched through the groups API

    if (circleFilter === 'nearby') {
      circles = circles.filter((g) => !g.isVirtual);
    } else if (circleFilter === 'online') {
      circles = circles.filter((g) => g.isVirtual);
    }

    return circles;
  }, [allCircles, searchQuery, circleFilter]);

  // Sort by distance (online circles without distance go to end)
  const sortedPersons = [...filteredPersons].sort((a, b) => {
    const aScore = a.proximityScore || a.distanceKm || 0;
    const bScore = b.proximityScore || b.distanceKm || 0;
    return aScore - bScore;
  });
  const sortedCircles = [...filteredCircles].sort((a, b) => {
    // Online circles (no distance) go to end
    if (a.isVirtual && !b.isVirtual) return 1;
    if (!a.isVirtual && b.isVirtual) return -1;
    // Both physical or both online - sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Create Gathering Form (slides in when active) */}
      {isCreating && (
        <CreateCircleForm
          userLat={userLat}
          userLng={userLng}
          userStation={userStation}
          onClose={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false);
            onCircleCreated?.();
          }}
        />
      )}

      {/* Manage Gathering Form (slides in when active) */}
      {managingCircle && (
        <ManageCircleForm
          circle={managingCircle}
          currentUserId={currentUserId}
          onClose={() => {
            setManagingCircle(null);
            onEditComplete?.();
          }}
          onSuccess={() => {
            setManagingCircle(null);
            onEditComplete?.();
            onCircleCreated?.();
          }}
        />
      )}
      {/* Intelligence Feed Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {activeTab === 'fellows' && (
          <div className="p-3 space-y-2">
            {sortedPersons.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">
                {searchQuery ? 'No brothers match your search.' : 'No brothers in range.'}
              </div>
            )}
            {sortedPersons.map((match) => {
              // Support both PersonMatchResult and nearby persons
              const person = match.person || match;
              const personId = person.id;
              const distance = match.proximityScore || match.distanceKm || 0;
              const isExpanded = expandedPersonId === personId;

              const interests = (person.interests || []).map((pi: any) => ({
                name: pi.interest?.name || pi.name,
                proficiencyLevel: pi.proficiencyLevel,
              }));

              // Categorize skills by proficiency level
              const mentorSkills = interests.filter((s: { name: string; proficiencyLevel: number }) => s.proficiencyLevel === 3);
              const practitionerSkills = interests.filter((s: { name: string; proficiencyLevel: number }) => s.proficiencyLevel === 2);
              const learnerSkills = interests.filter((s: { name: string; proficiencyLevel: number }) => s.proficiencyLevel === 1);

              return (
                <div key={personId}>
                  <MiniPillCard
                    id={`intel-item-${personId}`}
                    person={{
                      id: personId,
                      displayName: person.displayName,
                      profileImageUrl: person.profileImageUrl,
                      archetype: person.archetype,
                      interests,
                      bio: person.bio,
                      distanceKm: distance,
                      connectionStyle: person.connectionStyle,
                    }}
                    isHovered={hoveredItemId === personId}
                    isSelected={selectedItemId === personId}
                    onHover={(hovered) => onCardHover(hovered ? personId : null)}
                    onClick={() => setExpandedPersonId(isExpanded ? null : personId)}
                  />

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="bg-gray-50 border-l-2 border-blue-500 p-4 space-y-3">
                      {/* Bio */}
                      {person.bio && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            About
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {person.bio}
                          </p>
                        </div>
                      )}

                      {/* Skills */}
                      {interests.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Stewardship Toolkit
                          </h4>

                          <div className="space-y-3">
                            {/* Mentor Skills */}
                            {mentorSkills.length > 0 && (
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                  Mentor
                                </h5>
                                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                  {mentorSkills.map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded border border-amber-300 text-xs font-bold whitespace-nowrap flex-shrink-0"
                                    >
                                      {skill.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Practitioner Skills */}
                            {practitionerSkills.length > 0 && (
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                  Practitioner
                                </h5>
                                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                  {practitionerSkills.map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs font-semibold whitespace-nowrap flex-shrink-0"
                                    >
                                      {skill.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Learner Skills */}
                            {learnerSkills.length > 0 && (
                              <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                  Learning
                                </h5>
                                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                  {learnerSkills.map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded border border-gray-200 text-xs whitespace-nowrap flex-shrink-0"
                                    >
                                      {skill.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* How to Connect */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          How to Connect
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {person.connectionStyle ||
                            'Connect through community channels or in-person gatherings.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'circles' && (
          <>
            {/* Filter Chips - Tactical HUD controls */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex gap-2 items-center justify-between z-10">
              <div className="flex gap-2">
                <button
                  onClick={() => setCircleFilter('all')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition ${
                    circleFilter === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({allCircles.length})
                </button>
                <button
                  onClick={() => setCircleFilter('nearby')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition ${
                    circleFilter === 'nearby'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Nearby ({physicalGatherings.length})
                </button>
                <button
                  onClick={() => setCircleFilter('online')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition ${
                    circleFilter === 'online'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Online ({digitalGatherings.length})
                </button>
              </div>

              {/* Create Circle Button */}
              <button
                onClick={() => {
                  const url = new URL('/groups/create', window.location.origin);
                  url.searchParams.set('type', 'circle');
                  window.location.href = url.toString();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide transition"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Create Circle
              </button>
            </div>

            {/* Unified Circles Stream */}
            <div className="p-3 space-y-2">
              {sortedCircles.length === 0 && !searchQuery && (
                <div className="text-center py-12 px-4">
                  <div className="max-w-xs mx-auto">
                    <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Flame className="w-8 h-8 text-amber-600" strokeWidth={2} />
                    </div>
                    <p className="text-gray-600 font-semibold mb-1">No Circles in Range</p>
                    <p className="text-sm text-gray-500 mb-6">
                      {circleFilter === 'nearby'
                        ? 'Be the first to start a circle nearby.'
                        : circleFilter === 'online'
                        ? 'Start an online circle for remote fellowship.'
                        : 'Start a circle to connect with brothers.'}
                    </p>
                    <button
                      onClick={() => {
                        const url = new URL('/groups/create', window.location.origin);
                        url.searchParams.set('type', 'circle');
                        window.location.href = url.toString();
                      }}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm uppercase tracking-wide rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                      <Plus className="inline w-4 h-4 mr-1.5" />
                      Create Circle
                    </button>
                  </div>
                </div>
              )}
              {sortedCircles.length === 0 && searchQuery && (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No circles match your search.
                </div>
              )}
              {sortedCircles.map((circle) => {
                const isExpanded = expandedCircleId === circle.id;

                return (
                  <div key={circle.id}>
                    <CirclePillCard
                      id={`intel-item-${circle.id}`}
                      circle={circle}
                      isHovered={hoveredItemId === circle.id}
                      isSelected={selectedItemId === circle.id}
                      onHover={(hovered) => onCardHover(hovered ? circle.id : null)}
                      onClick={() => setExpandedCircleId(isExpanded ? null : circle.id)}
                      onManage={() => setManagingCircle(circle)}
                      currentUserId={currentUserId}
                    />

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="bg-gray-50 border-l-2 border-amber-500 p-4 space-y-3">
                        {/* Description */}
                        {circle.description && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                              About This Circle
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {circle.description}
                            </p>
                          </div>
                        )}

                        {/* Circle Type */}
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Type
                          </h4>
                          <span className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded border border-amber-300 text-xs font-bold">
                            {circle.type}
                          </span>
                        </div>

                        {/* Tags */}
                        {circle.tags.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                              Tags
                            </h4>
                            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                              {circle.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs font-semibold whitespace-nowrap flex-shrink-0"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* How to Join */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                            How to Join
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {circle.protocol ||
                              'Contact the circle host for more information.'}
                          </p>
                        </div>

                        {/* Host Information */}
                        {circle.creatorName && (
                          <div className="text-xs text-gray-500">
                            <span className="font-semibold">Hosted by:</span> {circle.creatorName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
