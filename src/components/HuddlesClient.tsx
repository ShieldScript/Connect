'use client';

import { useState } from 'react';
import { Shield, Users, MessageSquare, Plus, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { HuddleChat } from './HuddleChat';
import Link from 'next/link';

interface HuddlesClientProps {
  personId: string;
  personName: string;
  myHuddles: any[];
  availableHuddles: any[];
}

export function HuddlesClient({ personId, personName, myHuddles, availableHuddles }: HuddlesClientProps) {
  const [activeTab, setActiveTab] = useState<'my-huddles' | 'discover'>('my-huddles');
  const [selectedHuddleId, setSelectedHuddleId] = useState<string | null>(
    myHuddles.length > 0 ? myHuddles[0].id : null
  );
  const [discoveryModalHuddle, setDiscoveryModalHuddle] = useState<any | null>(null);
  const [myHuddleDetailsModal, setMyHuddleDetailsModal] = useState<any | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [selectedPersonProfile, setSelectedPersonProfile] = useState<any | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const selectedHuddle = myHuddles.find(h => h.id === selectedHuddleId);

  const handleJoinHuddle = async (huddleId: string) => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/groups/${huddleId}/join`, {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to join huddle');
      }

      // Success - reload page to show in My Huddles
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to join huddle');
      setIsJoining(false);
    }
  };

  const handleViewPersonProfile = async (personId: string) => {
    setIsLoadingProfile(true);
    try {
      const res = await fetch(`/api/persons/${personId}`);
      if (!res.ok) throw new Error('Failed to load profile');

      const profile = await res.json();
      setSelectedPersonProfile(profile);
    } catch (err: any) {
      alert(err.message || 'Failed to load profile');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <main className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Huddles</h1>
              <p className="text-gray-600 text-sm mt-0.5">
                Private accountability groups for spiritual growth
              </p>
            </div>
          </div>
          <Link
            href="/groups/create?type=huddle"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Start New Huddle
          </Link>
        </div>

        {/* Tabs - Underline Style */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('my-huddles')}
            className={`flex items-center gap-3 pb-4 border-b-2 transition ${
              activeTab === 'my-huddles'
                ? 'border-green-600'
                : 'border-transparent'
            }`}
          >
            <Shield className={`w-5 h-5 ${
              activeTab === 'my-huddles' ? 'text-gray-900' : 'text-gray-400'
            }`} strokeWidth={2} />
            <span className={`text-sm font-bold uppercase tracking-wide ${
              activeTab === 'my-huddles' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              My Huddles
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'my-huddles'
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {myHuddles.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-3 pb-4 border-b-2 transition ${
              activeTab === 'discover'
                ? 'border-green-600'
                : 'border-transparent'
            }`}
          >
            <Search className={`w-5 h-5 ${
              activeTab === 'discover' ? 'text-gray-900' : 'text-gray-400'
            }`} strokeWidth={2} />
            <span className={`text-sm font-bold uppercase tracking-wide ${
              activeTab === 'discover' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Discover
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'discover'
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {availableHuddles.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {activeTab === 'my-huddles' ? (
          myHuddles.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Shield className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Huddles Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Start or join a huddle to build deep accountability relationships with brothers.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Discover Huddles
                </button>
                <Link
                  href="/groups/create?type=huddle"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  <Plus className="inline w-4 h-4 mr-2" />
                  Start Your First Huddle
                </Link>
              </div>
            </div>
          ) : (
            /* Huddle Chat Interface */
            <div>
              {/* Huddle Dropdown Selector */}
              <div className="mb-6 relative">
                <div className="w-full bg-white border-2 border-green-200 rounded-lg">
                  <div className="flex items-start">
                    <button
                      onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                      className="flex-1 px-5 py-4 hover:bg-gray-50 transition text-left flex items-start gap-3 rounded-l-lg"
                    >
                      {selectedHuddle ? (
                        <>
                          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-gray-900 mb-1">
                              {selectedHuddle.name}
                            </h3>
                            {selectedHuddle.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {selectedHuddle.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1.5 text-gray-500">
                                <Users className="w-3.5 h-3.5" />
                                <span className="font-medium">{selectedHuddle.memberships?.length || 0}/{selectedHuddle.maxSize || 6} members</span>
                              </div>
                              {selectedHuddle.memberships && selectedHuddle.memberships.length > 0 && (
                                <div className="flex -space-x-1.5">
                                  {selectedHuddle.memberships.slice(0, 3).map((membership: any) => (
                                    <div
                                      key={membership.id}
                                      className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white"
                                      title={membership.person.displayName}
                                    >
                                      {membership.person.displayName[0]}
                                    </div>
                                  ))}
                                  {(selectedHuddle.memberships?.length || 0) > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold border-2 border-white">
                                      +{(selectedHuddle.memberships?.length || 0) - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                            isMoreDropdownOpen ? 'rotate-180' : ''
                          }`} />
                        </>
                      ) : (
                        <>
                          <span className="text-gray-500">Select a huddle...</span>
                          <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-auto transition-transform ${
                            isMoreDropdownOpen ? 'rotate-180' : ''
                          }`} />
                        </>
                      )}
                    </button>

                    {/* View Details button - aligned right */}
                    {selectedHuddle && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMyHuddleDetailsModal(selectedHuddle);
                        }}
                        className="px-6 py-4 border-l border-green-200 text-sm text-blue-600 hover:text-blue-700 hover:bg-green-50 font-semibold flex items-center gap-1 transition whitespace-nowrap rounded-r-lg"
                      >
                        View Details →
                      </button>
                    )}
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isMoreDropdownOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMoreDropdownOpen(false)}
                    />

                    {/* Dropdown content */}
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-green-200 rounded-lg shadow-xl z-20 max-h-[500px] overflow-y-auto">
                      <div className="p-2">
                        {myHuddles.map((huddle) => {
                          const isSelected = huddle.id === selectedHuddleId;
                          const memberCount = huddle.memberships?.length || 0;

                          return (
                            <button
                              key={huddle.id}
                              onClick={() => {
                                setSelectedHuddleId(huddle.id);
                                setIsMoreDropdownOpen(false);
                              }}
                              className={`w-full px-5 py-4 rounded-lg text-left transition ${
                                isSelected
                                  ? 'bg-green-50 border-2 border-green-600'
                                  : 'hover:bg-gray-50 border-2 border-transparent'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                  isSelected ? 'text-green-600' : 'text-gray-400'
                                }`} strokeWidth={2} />
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-bold text-base mb-1 ${
                                    isSelected ? 'text-green-900' : 'text-gray-900'
                                  }`}>
                                    {huddle.name}
                                  </h4>
                                  {huddle.description && (
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                      {huddle.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                      <Users className="w-3.5 h-3.5" />
                                      <span className="font-medium">{memberCount}/{huddle.maxSize || 6} members</span>
                                    </div>
                                    {huddle.memberships && huddle.memberships.length > 0 && (
                                      <div className="flex -space-x-1.5">
                                        {huddle.memberships.slice(0, 3).map((membership: any) => (
                                          <div
                                            key={membership.id}
                                            className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white"
                                            title={membership.person.displayName}
                                          >
                                            {membership.person.displayName[0]}
                                          </div>
                                        ))}
                                        {memberCount > 3 && (
                                          <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold border-2 border-white">
                                            +{memberCount - 3}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0 mt-1.5" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Selected Huddle Chat */}
              {selectedHuddle ? (
                <HuddleChat
                  huddleId={selectedHuddle.id}
                  personId={personId}
                  personName={personName}
                />
              ) : null}
            </div>
          )
        ) : (
          /* Discover Tab Content */
          <>
            {availableHuddles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Shield className="w-20 h-20 text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Available Huddles</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  There are no open huddles to join right now. Start your own huddle to build accountability relationships.
                </p>
                <Link
                  href="/groups/create?type=huddle"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  <Plus className="inline w-4 h-4 mr-2" />
                  Start New Huddle
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableHuddles.map((huddle) => {
                  const memberCount = huddle.memberships?.length || 0;
                  const spotsLeft = (huddle.maxSize || 6) - memberCount;
                  const isFull = huddle.currentSize >= huddle.maxSize;

                  return (
                    <button
                      key={huddle.id}
                      onClick={() => setDiscoveryModalHuddle(huddle)}
                      className={`bg-white rounded-xl border-2 p-6 transition group text-left ${
                        isFull
                          ? 'border-gray-300 opacity-75 hover:border-gray-400'
                          : 'border-green-200 hover:border-green-400 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          HUDDLE
                        </span>
                        {isFull ? (
                          <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                            FULL
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-green-600">
                            {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition">
                        {huddle.name}
                      </h3>

                      {huddle.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {huddle.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>{memberCount}/{huddle.maxSize || 6}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            <span>Chat</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                          View Details →
                        </span>
                      </div>

                      {/* Creator info */}
                      {huddle.creator && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Started by <span className="font-semibold text-gray-700">{huddle.creator.displayName}</span>
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Huddle Details Modal */}
      {discoveryModalHuddle && (() => {
        const modalMemberCount = discoveryModalHuddle.memberships?.length || 0;
        const modalSpotsLeft = discoveryModalHuddle.maxSize - modalMemberCount;
        const modalIsFull = discoveryModalHuddle.currentSize >= discoveryModalHuddle.maxSize;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDiscoveryModalHuddle(null)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setDiscoveryModalHuddle(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition z-10"
              >
                <span className="text-gray-600 text-xl">×</span>
              </button>

              {/* Header */}
              <div className={`p-8 border-b ${
                modalIsFull
                  ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
                  : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
              }`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    HUDDLE
                  </span>
                  {modalIsFull ? (
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                      FULL
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full">
                      {modalSpotsLeft} spot{modalSpotsLeft !== 1 ? 's' : ''} left
                    </span>
                  )}
                </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{discoveryModalHuddle.name}</h2>
              {discoveryModalHuddle.description && (
                <p className="text-gray-700 text-lg leading-relaxed">
                  {discoveryModalHuddle.description}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              {/* Members */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Members ({discoveryModalHuddle.memberships?.length || 0}/{discoveryModalHuddle.maxSize})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {discoveryModalHuddle.memberships?.map((membership: any) => (
                    <button
                      key={membership.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPersonProfile(membership.personId);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {membership.person.displayName[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {membership.person.displayName}
                      </span>
                      {membership.role === 'LEADER' && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          Leader
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Meeting Type
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {discoveryModalHuddle.isVirtual ? '💻 Virtual' : '📍 In-Person'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Group Size
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {discoveryModalHuddle.minSize}-{discoveryModalHuddle.maxSize} members
                  </div>
                </div>
              </div>

              {/* Creator */}
              {discoveryModalHuddle.creator && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                    Started By
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {discoveryModalHuddle.creator.displayName[0]}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {discoveryModalHuddle.creator.displayName}
                    </span>
                  </div>
                </div>
              )}

                {/* Covenant Reminder or Full Message */}
                {modalIsFull ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-gray-300">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">This Huddle is Full</h4>
                        <p className="text-sm text-gray-700">
                          All {discoveryModalHuddle.maxSize} spots are taken. Check back later or browse other available huddles below.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border-2 border-blue-200">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Accountability Commitment</h4>
                        <p className="text-sm text-gray-700">
                          By joining, you commit to showing up, being honest, and supporting your brothers in their spiritual growth.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Only show for available huddles */}
              {!modalIsFull && (
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setDiscoveryModalHuddle(null)}
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleJoinHuddle(discoveryModalHuddle.id)}
                    disabled={isJoining}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Join Huddle
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* My Huddle Details Modal */}
      {myHuddleDetailsModal && (() => {
        const modalMemberCount = myHuddleDetailsModal.memberships?.length || 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMyHuddleDetailsModal(null)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setMyHuddleDetailsModal(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition z-10"
              >
                <span className="text-gray-600 text-xl">×</span>
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 border-b border-green-200">
                <div className="flex items-start gap-3 mb-3">
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    HUDDLE
                  </span>
                  <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full">
                    {modalMemberCount}/{myHuddleDetailsModal.maxSize} members
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{myHuddleDetailsModal.name}</h2>
                {myHuddleDetailsModal.description && (
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {myHuddleDetailsModal.description}
                  </p>
                )}
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* Members */}
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                    Members ({modalMemberCount}/{myHuddleDetailsModal.maxSize})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {myHuddleDetailsModal.memberships?.map((membership: any) => (
                      <button
                        key={membership.id}
                        onClick={() => handleViewPersonProfile(membership.personId)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                          {membership.person.displayName[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {membership.person.displayName}
                        </span>
                        {membership.role === 'LEADER' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            Leader
                          </span>
                        )}
                        {membership.personId === personId && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            You
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Meeting Type
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {myHuddleDetailsModal.isVirtual ? '💻 Virtual' : '📍 In-Person'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Group Size
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {myHuddleDetailsModal.minSize}-{myHuddleDetailsModal.maxSize} members
                    </div>
                  </div>
                </div>

                {/* Creator */}
                {myHuddleDetailsModal.creator && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                      Started By
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        {myHuddleDetailsModal.creator.displayName[0]}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {myHuddleDetailsModal.creator.displayName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Person Profile Modal */}
      {selectedPersonProfile && (() => {
        // Categorize interests by proficiency level
        const mentorSkills = selectedPersonProfile.interests?.filter((i: any) => i.proficiencyLevel >= 4) || [];
        const practitionerSkills = selectedPersonProfile.interests?.filter((i: any) => i.proficiencyLevel >= 2 && i.proficiencyLevel < 4) || [];
        const learnerSkills = selectedPersonProfile.interests?.filter((i: any) => i.proficiencyLevel < 2) || [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedPersonProfile(null)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setSelectedPersonProfile(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition z-10"
              >
                <span className="text-gray-600 text-xl">×</span>
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 border-b border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                    {selectedPersonProfile.displayName[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPersonProfile.displayName}</h2>
                    {selectedPersonProfile.archetype && (
                      <p className="text-sm text-gray-600 mt-1">{selectedPersonProfile.archetype}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* Bio */}
                {selectedPersonProfile.bio && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      About
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedPersonProfile.bio}
                    </p>
                  </div>
                )}

                {/* Stewardship Toolkit */}
                {selectedPersonProfile.interests && selectedPersonProfile.interests.length > 0 && (
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
                            {mentorSkills.map((skill: any) => (
                              <span
                                key={skill.id}
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
                            {practitionerSkills.map((skill: any) => (
                              <span
                                key={skill.id}
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
                            {learnerSkills.map((skill: any) => (
                              <span
                                key={skill.id}
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
                    {selectedPersonProfile.connectionStyle ||
                      'Connect through community channels or in-person gatherings.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
