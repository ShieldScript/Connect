'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Trash2, RefreshCw } from 'lucide-react';

export default function ResetOnboardingPage() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [isReset, setIsReset] = useState(false);

  const handleReset = () => {
    // Clear the store
    store.reset();

    // Clear localStorage
    localStorage.removeItem('onboarding-storage');

    setIsReset(true);

    // Auto-redirect after 2 seconds
    setTimeout(() => {
      router.push('/onboarding/welcome');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Onboarding Data
          </h1>
          <p className="text-gray-600">
            This will clear all your onboarding progress and start fresh.
          </p>
        </div>

        {isReset ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-3 animate-spin" />
            <p className="text-green-900 font-semibold mb-2">
              ✓ Data Cleared!
            </p>
            <p className="text-sm text-green-700">
              Redirecting to onboarding...
            </p>
          </div>
        ) : (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-amber-900 mb-2">
                ⚠️ Warning
              </h3>
              <p className="text-sm text-amber-800">
                This action cannot be undone. All onboarding data will be permanently deleted from your browser.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Data & Start Fresh
              </button>

              <button
                onClick={() => router.back()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            What gets cleared:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• All personal information</li>
            <li>• Location data</li>
            <li>• Selected interests and activities</li>
            <li>• HEXACO-60 responses</li>
            <li>• All spiritual layer selections</li>
            <li>• Covenant agreement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
