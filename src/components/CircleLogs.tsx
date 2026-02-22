'use client';

import { useState, useEffect } from 'react';
import { Flame, Users, TrendingUp, Settings, Copy, Edit2, AlertTriangle, Calendar, Hammer, Shield, Compass, BookOpen, Wrench, Heart, Sparkles, Tent, Laugh, HandHeart, Crown, Lightbulb, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Circle {
  id: string;
  name: string;
  type: string;
  status: string;
  currentSize: number;
  maxSize: number | null;
  locationName: string | null;
  isVirtual: boolean;
  createdAt: string;
  description: string | null;
  protocol: string | null;
  memberships: Array<{
    person: {
      id: string;
      displayName: string;
      archetype: string | null;
    };
  }>;
}

interface CircleLogsProps {
  personId: string;
}

export function CircleLogs({ personId }: CircleLogsProps) {
  const router = useRouter();
  const [active, setActive] = useState<Circle[]>([]);
  const [history, setHistory] = useState<Circle[]>([]);
  const [stats, setStats] = useState({ totalCircles: 0, totalReached: 0, avgAttendance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMembers, setExpandedMembers] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCircles() {
      try {
        const res = await fetch('/api/groups/my-circles');
        if (!res.ok) throw new Error('Failed to fetch circles');

        const data = await res.json();
        setActive(data.active || []);
        setHistory(data.history || []);
        setStats(data.stats || { totalCircles: 0, totalReached: 0, avgAttendance: 0 });
      } catch (error) {
        console.error('Error fetching circles:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCircles();
  }, []);

  const handleRestart = (circle: Circle) => {
    // Store circle data for pre-filling the form
    const restartData = {
      name: circle.name,
      description: circle.description || '',
      protocol: circle.protocol || '',
      type: circle.type,
      locationName: circle.locationName,
      isVirtual: circle.isVirtual,
      maxSize: circle.maxSize || 12,
    };
    sessionStorage.setItem('restartCircle', JSON.stringify(restartData));
    router.push('/groups?restart=true');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
           ' @ ' +
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Helper: Get archetype icon with unique icons per archetype
  const getArchetypeIcon = (archetype: string | null) => {
    if (!archetype) return <Users className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    const archetypeLower = archetype.toLowerCase();

    // Wisdom & Knowledge
    if (archetypeLower.includes('sage')) return <BookOpen className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Craft & Creation
    if (archetypeLower.includes('builder')) return <Hammer className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('artisan')) return <Palette className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('architect')) return <Lightbulb className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Protection & Service
    if (archetypeLower.includes('guardian') || archetypeLower.includes('warrior') || archetypeLower.includes('watchman'))
      return <Shield className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('steward')) return <Wrench className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('caregiver') || archetypeLower.includes('provider'))
      return <HandHeart className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Leadership & Direction
    if (archetypeLower.includes('ruler')) return <Crown className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('navigator') || archetypeLower.includes('guide'))
      return <Compass className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Exploration & Adventure
    if (archetypeLower.includes('scout') || archetypeLower.includes('explorer'))
      return <Tent className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Relationships & Connection
    if (archetypeLower.includes('lover') || archetypeLower.includes('encourager'))
      return <Heart className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Transformation & Joy
    if (archetypeLower.includes('magician')) return <Sparkles className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('jester')) return <Laugh className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Default
    return <Users className="w-3 h-3 text-slate-500" strokeWidth={2} />;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate archetype distribution for stats
  const allMembers = [...active, ...history].flatMap(g => g.memberships);
  const archetypeCounts = allMembers.reduce((acc, m) => {
    const arch = m.person.archetype || 'Unknown';
    acc[arch] = (acc[arch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const primaryArchetype = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return (
    <div className="space-y-6">
      {/* Stewardship Metrics - The Ledger */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.totalCircles}</div>
          <div className="text-xs text-slate-600 uppercase tracking-wide font-semibold mt-1">Circles Led</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
          <div className="text-2xl font-bold text-blue-900">{stats.totalReached}</div>
          <div className="text-xs text-blue-700 uppercase tracking-wide font-semibold mt-1">Brothers Connected</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-4">
          <div className="text-2xl font-bold text-amber-900">{primaryArchetype}</div>
          <div className="text-xs text-amber-700 uppercase tracking-wide font-semibold mt-1">Primary Archetype</div>
        </div>
      </div>

      {/* Active Circles */}
      {active.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-300 px-6 py-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Active Circles</h3>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {active.map((circle) => {
                const archetypeCounts = circle.memberships.reduce((acc, m) => {
                  const arch = m.person.archetype || 'Unknown';
                  acc[arch] = (acc[arch] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);

                const capacityPercent = circle.maxSize
                  ? Math.round((circle.currentSize / circle.maxSize) * 100)
                  : 0;

                const isExpanded = expandedMembers === circle.id;

                return (
                  <div key={circle.id} className="border-2 border-gray-200 rounded-lg p-5 bg-white hover:border-gray-300 transition">
                    {/* Title & Date/Time */}
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 uppercase tracking-wide text-sm mb-2">{circle.name}</h4>
                      <div className="text-xs text-gray-600">
                        {formatDateTime(circle.createdAt)}
                      </div>
                    </div>

                    {/* Progress Bar - Visual Block Style */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                        <span>MEMBERS:</span>
                        <div className="flex-1 flex items-center gap-1">
                          {/* Visual progress blocks */}
                          {Array.from({ length: circle.maxSize || 12 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-3 flex-1 rounded-sm ${
                                i < circle.currentSize ? 'bg-green-600' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-900">{circle.currentSize}/{circle.maxSize || '∞'}</span>
                      </div>
                    </div>

                    {/* Circle Members (Expandable) */}
                    {isExpanded && circle.memberships.length > 0 && (
                      <div className="mb-4 bg-gray-50 border border-gray-200 rounded p-3">
                        <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Circle Members</div>
                        <div className="space-y-2">
                          {circle.memberships.map((membership) => (
                            <div key={membership.person.id} className="flex items-center gap-2 text-xs">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-bold text-blue-700">
                                  {membership.person.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900">{membership.person.displayName}</span>
                              <span className="text-gray-500">•</span>
                              <div className="flex items-center gap-1">
                                {getArchetypeIcon(membership.person.archetype)}
                                <span className="text-gray-600 text-xs uppercase tracking-wide">{membership.person.archetype || 'Brother'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedMembers(isExpanded ? null : circle.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 text-white rounded text-xs font-bold uppercase tracking-wide hover:bg-slate-800 transition"
                      >
                        <Users className="w-3 h-3" strokeWidth={2.5} />
{isExpanded ? 'Hide Members' : 'View Members'}
                      </button>
                      <button
                        onClick={() => router.push(`/groups?edit=${circle.id}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-gray-300 text-gray-700 rounded text-xs font-bold uppercase tracking-wide hover:bg-gray-50 transition"
                      >
                        <Edit2 className="w-3 h-3" strokeWidth={2.5} />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Past Circles */}
      {history.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-300 px-6 py-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Past Circles</h3>
            </div>
          </div>

          {/* High-Density Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Circle Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Brothers Served</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((circle) => (
                  <tr key={circle.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {formatDate(circle.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {circle.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        circle.isVirtual
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {circle.isVirtual ? 'Online' : 'Nearby'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">
                      {circle.currentSize}/{circle.maxSize || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRestart(circle)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-amber-400 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition text-xs font-bold uppercase tracking-wide"
                      >
                        <Copy className="w-3 h-3" strokeWidth={2.5} />
Start Again
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {active.length === 0 && history.length === 0 && (
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Flame className="w-8 h-8 text-gray-400" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">No Circles Yet</h3>
          <p className="text-sm text-gray-600 mb-6">
            Start your first circle to begin connecting with brothers.
          </p>
          <button
            onClick={() => router.push('/groups')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-bold text-sm uppercase tracking-wide"
          >
Start Your First Circle
          </button>
        </div>
      )}
    </div>
  );
}
