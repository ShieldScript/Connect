'use client';

import { useState } from 'react';
import { Menu, MoreVertical, Settings, HelpCircle, Shield, LogOut } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

interface TopBarProps {
  displayName: string;
  email: string;
  personId?: string;
  onToggleSidebar: () => void;
  onboardingLevel: number;
}

export function TopBar({ displayName, email, personId, onToggleSidebar, onboardingLevel }: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  const initial = displayName.charAt(0).toUpperCase();
  const isOnboarding = onboardingLevel === 0;
  const showUtilities = !isOnboarding;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-gray-50 border-b border-gray-200 z-30 flex items-center justify-between px-4">
      {/* Left: Hamburger + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-700" strokeWidth={2} />
        </button>
        <h1 className="text-base font-bold text-gray-900 uppercase tracking-wider">Connect</h1>
      </div>

      {/* Right: Utilities */}
      <div className="flex items-center gap-2">
        {/* Notification Hub - Hidden during onboarding */}
        {showUtilities && personId && (
          <NotificationBell personId={personId} />
        )}

        {/* Three-dot menu */}
        <div className="relative">
          <button
            onClick={() => setShowHelpMenu(!showHelpMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Help menu"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" strokeWidth={2} />
          </button>

          {showHelpMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowHelpMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <a href="/help" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <HelpCircle className="w-4 h-4" strokeWidth={2} />
                  Help & Support
                </a>
                <a href="/privacy" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Shield className="w-4 h-4" strokeWidth={2} />
                  Privacy Policy
                </a>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <div className="px-4 py-2 text-xs text-gray-500">
                    Version 0.1.0
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm hover:bg-blue-700 transition"
            aria-label="User menu"
          >
            {initial}
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
                <a href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings className="w-4 h-4" strokeWidth={2} />
                  Account Settings
                </a>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2} />
                    Sign Out
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
