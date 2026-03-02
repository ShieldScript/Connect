'use client';

import React from 'react';
import { Check, User, Shield, BookOpen, Lock, CheckCircle } from 'lucide-react';

interface Chapter {
  id: number;
  title: string;
  steps: number[];
  description?: string;
  icon: React.ElementType;
}

interface OnboardingSidebarProps {
  currentStep: number;
  totalSteps: number;
  selectedActivitiesCount?: number;
  requiredCount?: number;
  displayName?: string;
}

const chapters: Chapter[] = [
  {
    id: 1,
    title: 'IDENTITY',
    steps: [1, 2, 3, 4],
    description: 'Who you are',
    icon: User
  },
  {
    id: 2,
    title: 'STEWARDSHIP',
    steps: [5, 6, 7, 8, 9, 10, 11, 12],
    description: 'Your gifts & callings',
    icon: Shield
  },
  {
    id: 3,
    title: 'RHYTHMS',
    steps: [13, 14, 15],
    description: 'Your practices & growth',
    icon: BookOpen
  },
  {
    id: 4,
    title: 'DNA DISCOVERY',
    steps: [16],
    description: 'Personality assessment',
    icon: Lock
  },
  {
    id: 5,
    title: 'COMMITMENT',
    steps: [17, 18, 19],
    description: 'Review, Reveal, Covenant',
    icon: CheckCircle
  }
];

const stepLabels: { [key: number]: string } = {
  1: 'Welcome',
  2: 'Basic Info',
  3: 'Location',
  4: 'Interest Areas',
  5: 'Natural Giftings',
  6: 'Supernatural Giftings',
  7: 'Ministry Experience',
  8: 'Spiritual Milestones',
  9: 'Areas of Growth',
  10: 'Leadership Patterns',
  11: 'Life Stages',
  12: 'Calling Trajectories',
  13: 'Healing Themes',
  14: 'Rhythms & Practices',
  15: 'Boundaries',
  16: 'HEXACO-60',
  17: 'Review',
  18: 'DNA Reveal',
  19: 'Covenant'
};

export function OnboardingSidebar({ currentStep, totalSteps, selectedActivitiesCount = 0, requiredCount = 3, displayName }: OnboardingSidebarProps) {
  const getCurrentChapter = () => {
    return chapters.find(chapter => chapter.steps.includes(currentStep)) || chapters[0];
  };

  const currentChapter = getCurrentChapter();

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Your Stewardship Journey
        </h2>
        <p className="text-[11px] text-gray-600 leading-relaxed" style={{ lineHeight: '1.6' }}>
          Welcome, {displayName ? displayName.split(' ')[0] : 'Brother'}. Let's build your spiritual resume—the foundation of your fellowship connections.
        </p>
      </div>

      {/* Chapter Progress - Vertical Pipeline */}
      <div className="flex-1 overflow-y-auto p-6 relative pb-16">
        <div className="space-y-8 relative">
          {chapters.map((chapter, index) => {
            const isCompleted = chapter.steps.every(step => step < currentStep);
            const isActive = chapter.steps.includes(currentStep);
            const isFuture = chapter.steps.every(step => step > currentStep);
            const nextChapter = chapters[index + 1];
            const nextIsActive = nextChapter && nextChapter.steps.includes(currentStep);
            const nextIsFuture = nextChapter && nextChapter.steps.every(step => step > currentStep);

            return (
              <div key={chapter.id} className="relative">
                {/* Segmented Progress Line - Color Represents TARGET Status */}
                {index < chapters.length - 1 && (
                  <div className="absolute left-4 top-10 w-0.5 h-14">
                    {nextIsActive ? (
                      // Target is Active: Solid Gold (Paving the Road)
                      <div className="w-full h-full bg-amber-500" style={{ width: '2px' }} />
                    ) : nextIsFuture ? (
                      // Target is Future: Faint Dashed Gray
                      <div
                        className="w-full h-full border-l-2 border-dashed border-gray-300"
                        style={{ borderLeftWidth: '1.5px' }}
                      />
                    ) : (
                      // Target is Completed: Solid Forest Green
                      <div className="w-full h-full bg-emerald-600" style={{ width: '2px' }} />
                    )}
                  </div>
                )}

                {/* Chapter Milestone */}
                <div className={`flex items-center gap-3 mb-2`}>
                  {/* Circle - Ghost Style for Completed */}
                  <div className={`rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-all duration-300 ${
                    isCompleted
                      ? 'w-8 h-8 bg-white text-emerald-600 border-2 border-emerald-600'
                      : isActive
                      ? 'w-9 h-9 bg-amber-500 text-white border-2 border-amber-500 shadow-md'
                      : 'w-8 h-8 bg-white text-gray-400 border-2 border-gray-300'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : chapter.id}
                  </div>

                  {/* Chapter Label */}
                  <div>
                    <div className="flex items-center gap-2">
                      <chapter.icon className={`w-4 h-4 stroke-[2.5px] ${
                        isActive
                          ? 'text-amber-600'
                          : isCompleted
                          ? 'text-emerald-600'
                          : 'text-gray-400'
                      }`} />
                      <h3 className={`text-sm font-bold tracking-wide ${
                        isActive
                          ? 'text-amber-900'
                          : isCompleted
                          ? 'text-slate-700'
                          : 'text-slate-600'
                      }`}>
                        {chapter.title}
                      </h3>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                      {chapter.description}
                    </p>
                  </div>
                </div>

                {/* Sub-steps - String of Pearls */}
                {isActive && (
                  <div className="ml-10 mt-3 space-y-2.5 relative">
                    {/* Single Thin Vertical Line - Centered with 12px circles */}
                    <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gray-300" />

                    {chapter.steps.map((step) => {
                      const stepIsCompleted = step < currentStep;
                      const stepIsActive = step === currentStep;

                      return (
                        <div
                          key={step}
                          className={`flex items-center gap-3 text-xs ${
                            stepIsActive
                              ? 'text-amber-900 font-semibold'
                              : stepIsCompleted
                              ? 'text-emerald-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {stepIsCompleted ? (
                            <div className="w-3 h-3 rounded-full bg-emerald-600 flex items-center justify-center relative z-10">
                              <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className={`w-3 h-3 rounded-full relative z-10 ${
                              stepIsActive
                                ? 'bg-amber-500'
                                : 'bg-gray-300'
                            }`} />
                          )}
                          <span>{stepLabels[step] || `Step ${step}`}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Progress Dashboard - Separated from Journey Map */}
      <div className="border-t border-gray-200 p-4 mt-12">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">OVERALL PROGRESS</span>
          <span className="text-xs font-bold text-emerald-600">{progressPercentage}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

    </div>
  );
}
