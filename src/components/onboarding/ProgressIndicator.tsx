'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  className = '',
}: ProgressIndicatorProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isFuture = step > currentStep;

          return (
            <React.Fragment key={step}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 font-semibold
                    ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                          ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-200'
                          : 'bg-gray-200 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>

                {/* Step Label */}
                {stepLabels && stepLabels[step - 1] && (
                  <span
                    className={`
                      mt-2 text-xs text-center max-w-[80px]
                      ${
                        isCompleted || isCurrent
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-400'
                      }
                    `}
                  >
                    {stepLabels[step - 1]}
                  </span>
                )}
              </div>

              {/* Connector Line */}
              {step < totalSteps && (
                <div
                  className={`
                    flex-1 h-1 mx-2 transition-all duration-300
                    ${
                      step < currentStep
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
