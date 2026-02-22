'use client';

import { Check } from 'lucide-react';

interface JourneyProgressProps {
  onboardingLevel: number;
  onStartJourney?: () => void;
  showButton?: boolean;
}

const JOURNEY_STEPS = [
  { id: 1, label: 'Claim Your Identity', description: 'Enter Display Name and Location (Community/City).' },
  { id: 2, label: 'Identify Your Craft', description: 'Select skills and Proficiency Level (1, 2, or 3).' },
  { id: 3, label: 'Discover Your Archetype', description: 'Choose your persona (Builder, Watchman, etc.).' },
  { id: 4, label: 'Set Your Style', description: 'Define how you prefer to connect (Groups, 1-on-1).' },
  { id: 5, label: 'Join the Brotherhood', description: 'Final review and activation (Welcome Letter).' },
];

export function JourneyProgress({ onboardingLevel, onStartJourney, showButton = true }: JourneyProgressProps) {
  const completedSteps = Math.min(onboardingLevel, 5);
  const progressPercentage = (completedSteps / 5) * 100;

  if (onboardingLevel >= 1) {
    // Already onboarded - show completion badge
    return (
      <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-900">Journey Complete</h3>
            <p className="text-xs text-green-700">Stewardship Defined</p>
          </div>
        </div>
      </div>
    );
  }

  // Not onboarded - show progress tracker
  return (
    <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-blue-900">Your Journey</h3>
          <span className="text-xs font-bold text-blue-700">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {JOURNEY_STEPS.map((step) => {
            const isCompleted = completedSteps >= step.id;
            const isCurrent = completedSteps + 1 === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 text-xs ${
                  isCompleted
                    ? 'text-green-700'
                    : isCurrent
                    ? 'text-blue-900 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {step.id}
                  </div>
                )}
                <span className="flex-1">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Button - Royal Blue - Only show when showButton is true */}
      {showButton && onStartJourney && (
        <button
          onClick={onStartJourney}
          className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-800 hover:to-blue-700 transition-all"
        >
          {completedSteps === 0 ? 'Start Journey' : 'Continue Journey'}
        </button>
      )}

      {/* Identity Message - Simplified */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-800 font-medium text-center">
          Define your stewardship to be seen by the fellowship.
        </p>
      </div>
    </div>
  );
}
