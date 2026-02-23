'use client';

import { Map, Users, Flame, Plus, ChevronDown, Search, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface DiscoveryHeaderProps {
  selectedRadius: number;
  onRadiusChange: (radius: number) => void;
  isSavingRadius?: boolean;
  activeTab: 'fellows' | 'circles';
  onTabChange: (tab: 'fellows' | 'circles') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  fellowCount: number;
  circleCount?: number;
}

const RADIUS_OPTIONS = [
  { value: 5, label: '5km' },
  { value: 10, label: '10km' },
  { value: 25, label: '25km' },
  { value: 50, label: '50km' },
  { value: 999, label: 'Global' },
];

export function DiscoveryHeader({
  selectedRadius,
  onRadiusChange,
  isSavingRadius = false,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  fellowCount,
  circleCount = 0,
}: DiscoveryHeaderProps) {
  const [isRadiusDropdownOpen, setIsRadiusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRadiusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedRadiusLabel =
    RADIUS_OPTIONS.find((opt) => opt.value === selectedRadius)?.label || '5km';

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-200 px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
            <Map className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Brotherhood</h1>
            <p className="text-gray-600 text-sm mt-0.5">
              Find brothers and circles nearby
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border-2 border-indigo-200 focus:border-indigo-500 text-sm rounded-lg outline-none transition w-48"
            />
          </div>

          {/* Radius Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsRadiusDropdownOpen(!isRadiusDropdownOpen)}
              disabled={isSavingRadius}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-indigo-200 hover:border-indigo-300 text-gray-700 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingRadius ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{selectedRadiusLabel}</span>
                  <ChevronDown className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>

            {isRadiusDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[1100] min-w-[120px]">
                {RADIUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onRadiusChange(option.value);
                      setIsRadiusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition ${
                      selectedRadius === option.value
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/groups/create"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Circle
          </Link>
        </div>
      </div>

      {/* Tabs - Underline Style */}
      <div className="flex items-center gap-8">
        <button
          onClick={() => onTabChange('fellows')}
          className={`flex items-center gap-3 pb-4 border-b-2 transition ${
            activeTab === 'fellows'
              ? 'border-indigo-600'
              : 'border-transparent'
          }`}
        >
          <Users className={`w-5 h-5 ${
            activeTab === 'fellows' ? 'text-gray-900' : 'text-gray-400'
          }`} strokeWidth={2} />
          <span className={`font-semibold ${
            activeTab === 'fellows' ? 'text-gray-900' : 'text-gray-500'
          }`}>
            Brothers
          </span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
            activeTab === 'fellows' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {fellowCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange('circles')}
          className={`flex items-center gap-3 pb-4 border-b-2 transition ${
            activeTab === 'circles'
              ? 'border-amber-600'
              : 'border-transparent'
          }`}
        >
          <Flame className={`w-5 h-5 ${
            activeTab === 'circles' ? 'text-gray-900' : 'text-gray-400'
          }`} strokeWidth={2} />
          <span className={`font-semibold ${
            activeTab === 'circles' ? 'text-gray-900' : 'text-gray-500'
          }`}>
            Circles
          </span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
            activeTab === 'circles' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {circleCount}
          </span>
        </button>
      </div>
    </div>
  );
}
