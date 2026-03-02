'use client';

import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HexacoCompletionCardProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function HexacoCompletionCard({ onComplete, onBack }: HexacoCompletionCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="flex items-center gap-4 max-w-6xl mx-auto">
      {/* Left Arrow Navigation */}
      <button
        onClick={onBack}
        className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-all"
        aria-label="Review Questions"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Completion Card */}
      <div
        className={`
          flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 border-l-4 border-l-amber-500 p-12
          transition-all duration-500
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Success Animation */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Checkmark Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-emerald-500 rounded-full p-6">
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900">
            Identity Data Captured
          </h2>

          {/* Main Message */}
          <div className="max-w-xl space-y-4">
            <p className="text-lg text-emerald-700 font-semibold">
              Your Natural DNA is now part of your profile.
            </p>

            <p className="text-gray-600 leading-relaxed">
              You've completed the internal mapping of your Identity. This data is now being woven into your Spiritual Resume.
            </p>
          </div>

          {/* Next Step Indicator */}
          <div className="pt-4">
            <p className="text-sm text-gray-500">
              Click Continue to proceed to the Stewardship pillar
            </p>
          </div>
        </div>
      </div>

      {/* Right Spacer */}
      <div className="flex-shrink-0 w-12 h-12" />
    </div>
  );
}
