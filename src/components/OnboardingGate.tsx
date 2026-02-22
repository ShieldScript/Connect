'use client';

interface OnboardingGateProps {
  onStartJourney: () => void;
  onDismiss: () => void;
}

export function OnboardingGate({ onStartJourney, onDismiss }: OnboardingGateProps) {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      {/* Dimmed Dashboard Preview (visible behind) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {/* This creates the "dimmed dashboard" effect */}
      </div>

      {/* Prominent Call-to-Action Card */}
      <div className="relative z-50 max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Define Your Stewardship
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              To connect with the right brothers and groups, we need to map your gifts.
            </p>
          </div>

          {/* Value Propositions */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Map Your Field</h3>
                <p className="text-sm text-gray-600">Share your location and availability</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Identify Your Craft</h3>
                <p className="text-sm text-gray-600">What skills do you bring to the table?</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Discover Your Archetype</h3>
                <p className="text-sm text-gray-600">Find your role in the brotherhood</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={onStartJourney}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-800 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 mb-4"
            >
              Start My Journey
            </button>

            <p className="text-sm text-gray-500">
              Takes about 3 minutes · Can save and return anytime
            </p>
          </div>
        </div>

        {/* Small "Skip for now" option (subtle) */}
        <div className="text-center mt-6">
          <button
            onClick={onDismiss}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            I'll do this later
          </button>
        </div>
      </div>
    </div>
  );
}
