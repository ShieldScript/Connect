'use client';

import { ChevronDown } from 'lucide-react';

interface LocationSectionProps {
  community: string;
  city: string;
  region: string;
  searchRadius: number;
  isEditing: boolean;
  onEditToggle: () => void;
  onCommunityChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onSearchRadiusChange: (value: number) => void;
}

const RADIUS_OPTIONS = [5, 10, 25, 50, 999];

export function LocationSection({
  community,
  city,
  region,
  searchRadius,
  isEditing,
  onEditToggle,
  onCommunityChange,
  onCityChange,
  onRegionChange,
  onSearchRadiusChange,
}: LocationSectionProps) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          LOCATION & DISCOVERY
        </h2>
        <button
          onClick={onEditToggle}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Home Location - 3 fields */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Your Location
            </h3>

            {/* Community Input */}
            <div className="relative bg-gray-50 px-4 py-4 rounded-lg mb-4">
              <input
                id="community-edit"
                type="text"
                value={community}
                onChange={(e) => onCommunityChange(e.target.value)}
                placeholder=" "
                className="peer w-full text-lg px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors bg-transparent placeholder-transparent"
                maxLength={100}
              />
              <label htmlFor="community-edit" className="absolute left-4 top-1 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-6 peer-focus:top-1 peer-focus:text-gray-600 peer-focus:text-sm cursor-text">
                Community or Neighborhood
              </label>
              {community.trim() && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* City and Region - Split Row */}
            <div className="flex gap-4">
              {/* City */}
              <div className="relative flex-[3] bg-gray-50 px-4 py-4 rounded-lg">
                <input
                  id="city-edit"
                  type="text"
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  placeholder=" "
                  className="peer w-full text-lg px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors bg-transparent placeholder-transparent"
                  maxLength={100}
                />
                <label htmlFor="city-edit" className="absolute left-4 top-1 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-6 peer-focus:top-1 peer-focus:text-gray-600 peer-focus:text-sm cursor-text">
                  City
                </label>
                {city.trim() && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Region */}
              <div className="relative flex-[2] bg-gray-50 px-4 py-4 rounded-lg">
                <input
                  id="region-edit"
                  type="text"
                  value={region}
                  onChange={(e) => onRegionChange(e.target.value)}
                  placeholder=" "
                  className="peer w-full text-lg px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors bg-transparent placeholder-transparent"
                  maxLength={100}
                />
                <label htmlFor="region-edit" className="absolute left-4 top-1 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-6 peer-focus:top-1 peer-focus:text-gray-600 peer-focus:text-sm cursor-text">
                  Region / State
                </label>
                {region.trim() && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Radius */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                SEARCH RADIUS
              </label>
              <div className="relative">
                <select
                  value={searchRadius}
                  onChange={(e) => onSearchRadiusChange(Number(e.target.value))}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {RADIUS_OPTIONS.map(radius => (
                    <option key={radius} value={radius}>
                      {radius === 999 ? 'Global' : `${radius}km`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your Location</div>
            <div className="text-sm font-medium text-gray-900">
              {[community, city, region].filter(Boolean).join(', ') ||
                <span className="text-gray-400 italic">Not set</span>}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Search Radius</div>
            <div className="text-sm font-medium text-gray-900">
              {searchRadius === 999 ? 'Global' : `${searchRadius}km`}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
