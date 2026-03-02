'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, SkipForward, Info, Lock } from 'lucide-react';
import { OnboardingSidebar } from './OnboardingSidebar';

interface OnboardingStepProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  stepTitle?: string; // e.g., "Interest Areas"
  description: string;
  quote?: string;
  skippable?: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  children: React.ReactNode;
  nextButtonText?: string;
  nextButtonDisabled?: boolean;
  selectedActivitiesCount?: number;
  requiredCount?: number;
  maxCount?: number;
  showPrivacyBadge?: boolean;
  displayName?: string;
  focusMode?: boolean; // DNA Discovery mode: dims sidebar, removes footer, fullscreen content
  focusModeHeader?: React.ReactNode; // Custom header for focus mode
  customTopBarContent?: React.ReactNode; // Custom content for top bar (e.g., batch status)
  customFooterInfo?: React.ReactNode; // Custom info for footer (e.g., question count)
}

export function OnboardingStep({
  stepNumber,
  totalSteps,
  title,
  stepTitle,
  description,
  quote,
  skippable = false,
  onNext,
  onBack,
  onSkip,
  children,
  nextButtonText = 'Continue',
  nextButtonDisabled = false,
  selectedActivitiesCount,
  requiredCount,
  maxCount,
  showPrivacyBadge = false,
  displayName,
  focusMode = false,
  focusModeHeader,
  customTopBarContent,
  customFooterInfo,
}: OnboardingStepProps) {
  const getChapterInfo = () => {
    if (stepNumber <= 4) return { name: 'IDENTITY', step: stepNumber, total: 4 };
    if (stepNumber <= 12) return { name: 'STEWARDSHIP', step: stepNumber - 4, total: 8 };
    if (stepNumber <= 15) return { name: 'RHYTHMS', step: stepNumber - 12, total: 3 };
    if (stepNumber === 16) return { name: 'DNA DISCOVERY', step: 1, total: 1 };
    if (stepNumber === 17) return { name: 'REVIEW', step: 1, total: 3 };
    if (stepNumber === 18) return { name: 'REVEAL', step: 2, total: 3 };
    if (stepNumber === 19) return { name: 'COVENANT', step: 3, total: 3 };
    return { name: 'COMMITMENT', step: stepNumber - 16, total: 3 };
  };

  const chapter = getChapterInfo();

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex">
      {/* Left Sidebar - The Progress Pipeline */}
      <aside className={`hidden lg:block w-64 fixed left-0 top-0 bottom-0 overflow-y-auto transition-opacity duration-500 ${
        focusMode ? 'opacity-90' : ''
      }`}>
        <OnboardingSidebar
          currentStep={stepNumber}
          totalSteps={totalSteps}
          selectedActivitiesCount={selectedActivitiesCount}
          requiredCount={requiredCount}
          displayName={displayName}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen">
        {/* Custom Focus Mode Header Overlay */}
        {focusMode && focusModeHeader && (
          <div className="absolute top-0 left-0 right-0 z-50">
            {focusModeHeader}
          </div>
        )}

        {/* Clean Top Nav - Breadcrumb Style */}
        <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-opacity duration-500 ${
          focusMode ? 'opacity-90' : ''
        }`}>
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                {/* Breadcrumb Hierarchy */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {chapter.name}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stepTitle || title}
                  </span>
                </div>

              {/* Custom Top Bar Content OR Selection Status */}
              {customTopBarContent || (
                selectedActivitiesCount !== undefined && requiredCount !== undefined && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedActivitiesCount >= requiredCount
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-orange-50 text-orange-700 border-2 border-orange-300'
                  }`}>
                    {selectedActivitiesCount >= requiredCount && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span>{selectedActivitiesCount} / {requiredCount} selected</span>
                  </div>
                )
              )}
            </div>
          </div>
        </header>

        {/* Main Content - Centered with whitespace */}
        <main className="flex-1 overflow-y-auto pb-24">
          {focusMode ? (
            // Focus Mode: Fullscreen content without card wrapper
            <div className="h-full">
              {children}
            </div>
          ) : (
            <div className="max-w-5xl mx-auto px-6 py-8">
              {/* Content Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                {/* Header - Clean and Breathable */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {showPrivacyBadge && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-800 text-xs font-semibold">
                        <Lock className="w-3 h-3" />
                        <span>100% Private</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 italic">{description}</p>
                </div>

                {/* Main Content */}
                <div className="py-4">{children}</div>
              </div>
            </div>
          )}
        </main>

        {/* Fixed Bottom Action Bar - Glassmorphism (Soft Focus in DNA Discovery Mode) */}
        <footer className={`fixed bottom-0 left-0 lg:left-64 right-0 bg-[#F9F8F6]/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg z-40 transition-opacity duration-500 ${
          focusMode ? 'opacity-90' : ''
        }`}>
          <div className="max-w-5xl mx-auto px-6 py-4">
            {/* Bible Quote - The Commission (Full verse with citation) */}
            {quote && (
              <p className="text-center text-xs italic text-slate-500 font-serif mb-3 leading-relaxed" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {quote}
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              {/* Left Side: Previous Button */}
              <button
                type="button"
                onClick={onBack}
                disabled={stepNumber === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-600 hover:text-gray-900 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Previous</span>
              </button>

              {/* Center: Custom Footer Info (e.g., Question Count) */}
              {customFooterInfo && (
                <div className="absolute left-1/2 -translate-x-1/2 text-sm text-gray-600 font-medium">
                  {customFooterInfo}
                </div>
              )}

              {/* Right Action Group - Tight Spacing */}
              <div className="flex items-center gap-7">
                {/* Skip Group - Tightly Coupled */}
                {skippable && onSkip && (
                  <div className="flex items-center gap-2 group relative">
                    {/* Info Icon with Tooltip */}
                    <div className="relative flex items-center">
                      <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                        Not sure? You can always come back to this in your profile later.
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                          <div className="border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      </div>
                    </div>

                    {/* Skip Link */}
                    <button
                      type="button"
                      onClick={onSkip}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <span className="text-sm">Skip for now</span>
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Continue Button - Vibrant Orange (Primary Action) */}
                <button
                  type="button"
                  onClick={onNext}
                  disabled={nextButtonDisabled}
                  className={`
                    flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm
                    transition-all duration-300
                    ${
                      nextButtonDisabled
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                    }
                  `}
                >
                  <span>{nextButtonText || 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
