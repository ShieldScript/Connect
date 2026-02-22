'use client';

import { useRouter } from 'next/navigation';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSaveAndExit = () => {
    onClose();
    // Optionally save progress to localStorage or database
    console.log('Saving progress...');
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header with Save & Exit */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Define Your Stewardship</h1>
            <p className="text-sm text-gray-600">Complete your journey to join the fellowship</p>
          </div>
          <button
            onClick={handleSaveAndExit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Save & Exit
          </button>
        </div>
      </div>

      {/* Onboarding Content - Embed iframe to existing /onboarding page */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">
            The onboarding form will be embedded here, or we can redirect to /onboarding route.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    </div>
  );
}
