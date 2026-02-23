'use client';

import { useState } from 'react';
import { Settings, RotateCcw, X } from 'lucide-react';

interface DevMenuProps {
  personId: string;
  currentOnboardingLevel: number;
}

export function DevMenu({ personId, currentOnboardingLevel }: DevMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetOnboarding = async () => {
    if (!confirm('Reset onboarding? This will:\n- Set onboardingLevel to 0\n- Clear welcome letter flag\n- Reload the page')) {
      return;
    }

    setIsResetting(true);

    try {
      // Call API to reset onboarding level in database
      const response = await fetch('/api/dev/reset-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset onboarding');
      }

      // Clear localStorage
      localStorage.removeItem(`welcome-letter-shown-${personId}`);
      localStorage.removeItem('sidebar-open');

      // Reload page
      window.location.reload();
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      alert('Failed to reset onboarding. Check console for details.');
      setIsResetting(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all"
          title="Open Dev Menu"
        >
          <Settings className="w-5 h-5" strokeWidth={2} />
        </button>
      )}

      {/* Dev Menu Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-purple-600 rounded-lg shadow-2xl w-80 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" strokeWidth={2} />
              <h3 className="font-bold text-gray-900">Dev Menu</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Current State */}
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-semibold text-purple-900 mb-1">Current State</p>
            <p className="text-sm text-purple-700">
              Onboarding Level: <span className="font-bold">{currentOnboardingLevel}</span>
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {currentOnboardingLevel === 0 ? '(Not completed)' : '(Completed)'}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleResetOnboarding}
              disabled={isResetting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition"
            >
              {isResetting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" strokeWidth={2} />
                  Reset Onboarding
                </>
              )}
            </button>

            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <p className="font-semibold mb-1">What this does:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Sets onboardingLevel to 0</li>
                <li>Clears welcome letter flag</li>
                <li>Reloads the page</li>
              </ul>
            </div>
          </div>

          {/* Environment Badge */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Testing Mode - Use with caution
            </p>
          </div>
        </div>
      )}
    </>
  );
}
