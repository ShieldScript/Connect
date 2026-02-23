'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Map, User, Lock, Shield, HandHeart } from 'lucide-react';
import { JourneyProgress } from './JourneyProgress';

interface CollapsibleSidebarProps {
  isOpen: boolean;
  onboardingLevel: number;
  onStartJourney?: () => void;
  onGroupsClick?: (e: React.MouseEvent) => void;
  highlightJourney?: boolean;
  station?: string;
  city?: string;
  region?: string;
  connectionStyle?: string;
  latitude?: number;
  longitude?: number;
}

export function CollapsibleSidebar({
  isOpen,
  onboardingLevel,
  onStartJourney,
  onGroupsClick,
  highlightJourney = false,
  station = '',
  city = '',
  region = '',
  connectionStyle = 'Builders',
  latitude,
  longitude,
}: CollapsibleSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isOnboarding = onboardingLevel === 0;

  // Helper function to determine active link
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-20 flex flex-col ${
        isOpen ? 'w-72' : 'w-16'
      }`}
    >
      {/* Primary Navigation */}
      <nav className={`px-3 py-6 space-y-2 ${!isOnboarding ? 'flex-1' : ''}`}>
        <a
          href="/"
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition focus:outline-none ${
            isActive('/')
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          title={!isOpen ? 'Dashboard' : undefined}
        >
          <LayoutDashboard
            className={`w-5 h-5 flex-shrink-0 ${isActive('/') ? 'text-white' : ''}`}
            strokeWidth={2.5}
          />
          <span className={`${!isOpen ? 'hidden' : ''} ${isActive('/') ? 'text-white' : ''}`}>
            Dashboard
          </span>
        </a>

        <a
          href="/groups"
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition relative focus:outline-none ${
            isActive('/groups')
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          onClick={onGroupsClick}
          title={!isOpen ? 'Brotherhood' : undefined}
        >
          <Map
            className={`w-5 h-5 flex-shrink-0 ${isActive('/groups') ? 'text-white' : 'text-indigo-600'}`}
            strokeWidth={2}
          />
          <span className={`flex-1 ${!isOpen ? 'hidden' : ''} ${isActive('/groups') ? 'text-white' : ''}`}>
            Brotherhood
          </span>
          {onboardingLevel === 0 && (
            <Lock className={`w-4 h-4 text-blue-600 ${!isOpen ? 'hidden' : 'ml-auto'}`} strokeWidth={2} />
          )}
        </a>

        <a
          href="/huddles"
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition relative focus:outline-none ${
            isActive('/huddles')
              ? 'bg-green-600 text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          onClick={onGroupsClick}
          title={!isOpen ? 'My Huddles' : undefined}
        >
          <Shield
            className={`w-5 h-5 flex-shrink-0 ${isActive('/huddles') ? 'text-white' : 'text-green-600'}`}
            strokeWidth={2}
          />
          <span className={`flex-1 ${!isOpen ? 'hidden' : ''} ${isActive('/huddles') ? 'text-white' : ''}`}>
            My Huddles
          </span>
          {onboardingLevel === 0 && (
            <Lock className={`w-4 h-4 text-blue-600 ${!isOpen ? 'hidden' : 'ml-auto'}`} strokeWidth={2} />
          )}
        </a>

        <a
          href="/prayers"
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition relative focus:outline-none ${
            isActive('/prayers')
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          onClick={onGroupsClick}
          title={!isOpen ? 'Prayer Wall' : undefined}
        >
          <HandHeart
            className={`w-5 h-5 flex-shrink-0 ${isActive('/prayers') ? 'text-white' : 'text-blue-600'}`}
            strokeWidth={2}
          />
          <span className={`flex-1 ${!isOpen ? 'hidden' : ''} ${isActive('/prayers') ? 'text-white' : ''}`}>
            Prayer Wall
          </span>
          {onboardingLevel === 0 && (
            <Lock className={`w-4 h-4 text-blue-600 ${!isOpen ? 'hidden' : 'ml-auto'}`} strokeWidth={2} />
          )}
        </a>

        <a
          href="/profile"
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition focus:outline-none ${
            isActive('/profile')
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          title={!isOpen ? 'My Profile' : undefined}
        >
          <User
            className={`w-5 h-5 flex-shrink-0 ${isActive('/profile') ? 'text-white' : ''}`}
            strokeWidth={2}
          />
          <span className={`${!isOpen ? 'hidden' : ''} ${isActive('/profile') ? 'text-white' : ''}`}>
            My Profile
          </span>
        </a>
      </nav>

      {/* Journey Progress - Only show during onboarding */}
      {isOnboarding && (
        <div className={`flex-1 px-3 py-4 ${highlightJourney ? 'animate-pulse' : ''}`}>
          {isOpen ? (
            <JourneyProgress
              onboardingLevel={onboardingLevel}
              onStartJourney={onStartJourney}
              showButton={false}
            />
          ) : (
            <button
              onClick={onStartJourney}
              className="w-10 h-10 mx-auto flex items-center justify-center relative"
              aria-label="Journey progress"
              title="Your Journey: 0%"
            >
              {/* Progress ring */}
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold text-blue-700">0%</span>
            </button>
          )}
        </div>
      )}

      {/* Community Info */}
      {!isOnboarding && isOpen && (
        <div className="px-3 py-3 border-t border-gray-200 bg-gray-50">
          <div className="space-y-2">
            {/* Your Location */}
            <div>
              <div className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-0.5">
                Your Community
              </div>
              <div className="text-gray-700 font-semibold text-xs">
                {station ? `${station} @ ` : ''}{city || 'Not set'}{region ? `, ${region}` : ''}
              </div>
            </div>

            {/* Fellowship Style */}
            <div>
              <div className="text-gray-500 font-semibold text-[10px] uppercase tracking-wide mb-1">
                Fellowship Style
              </div>
              <div className="inline-flex items-center px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-blue-700 font-semibold text-xs">
                  {connectionStyle || 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
