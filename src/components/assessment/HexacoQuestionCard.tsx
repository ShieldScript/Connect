'use client';

import { HexacoQuestion } from '@/data/hexacoQuestions';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface HexacoQuestionCardProps {
  question: HexacoQuestion;
  currentAnswer?: number;
  onAnswer: (score: 1 | 2 | 3 | 4 | 5) => void;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  direction: 'forward' | 'back';
}

const PROFICIENCY_LABELS = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree',
};

const PROFICIENCY_COLORS = {
  1: {
    color: 'bg-red-100',
    border: 'border-red-500',
    shadow: 'shadow-red-200',
    textColor: 'text-red-800',
  },
  2: {
    color: 'bg-orange-100',
    border: 'border-orange-500',
    shadow: 'shadow-orange-200',
    textColor: 'text-orange-800',
  },
  3: {
    color: 'bg-gray-100',
    border: 'border-gray-500',
    shadow: 'shadow-gray-200',
    textColor: 'text-gray-800',
  },
  4: {
    color: 'bg-emerald-100',
    border: 'border-emerald-500',
    shadow: 'shadow-emerald-200',
    textColor: 'text-emerald-800',
  },
  5: {
    color: 'bg-green-100',
    border: 'border-green-500',
    shadow: 'shadow-green-200',
    textColor: 'text-green-800',
  },
};

export default function HexacoQuestionCard({
  question,
  currentAnswer,
  onAnswer,
  onBack,
  onForward,
  canGoBack,
  canGoForward,
  direction,
}: HexacoQuestionCardProps) {
  return (
    <div className="flex items-center gap-4 max-w-6xl mx-auto">
      {/* Left Arrow Navigation - STATIC (does not animate) */}
      {canGoBack && onBack ? (
        <button
          onClick={onBack}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-all"
          aria-label="Previous Question"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      ) : (
        <div className="flex-shrink-0 w-12 h-12" />
      )}

      {/* Question Card - ANIMATED (slides in/out) */}
      <div
        className={`
          flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 border-l-4 border-l-amber-500 p-8 space-y-6
          animate-in duration-300 fade-in
          ${direction === 'forward' ? 'slide-in-from-right' : 'slide-in-from-left'}
        `}
      >
        {/* Question Text */}
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900 leading-relaxed min-h-[80px] flex items-center justify-center">
            {question.text}
          </p>
        </div>

        {/* Proficiency Slider - Same as CategoryGridLayerStep */}
        <div className="space-y-4">
          {/* Segmented Proficiency Bar */}
          <div className="flex w-full gap-1">
            {([1, 2, 3, 4, 5] as const).map((level, index) => {
              const isActive = currentAnswer === level;
              const isFirst = index === 0;
              const isLast = index === 4;
              const colors = PROFICIENCY_COLORS[level];

              return (
                <button
                  key={level}
                  onClick={() => onAnswer(level)}
                  className={`
                    flex-1 px-3 py-4 text-xs font-semibold
                    transition-all duration-300
                    ${isFirst ? 'rounded-l-full' : ''}
                    ${isLast ? 'rounded-r-full' : ''}
                    ${
                      isActive
                        ? `${colors.color} ${colors.shadow} border-2 ${colors.border} z-10 relative scale-[1.02]`
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  {PROFICIENCY_LABELS[level]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Helper Text */}
        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 italic">
            Answer instinctively based on your natural temperament, not your ideal self
          </p>
        </div>
      </div>

      {/* Right Arrow Navigation - STATIC (does not animate) */}
      {canGoForward && onForward ? (
        <button
          onClick={onForward}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-all"
          aria-label="Next Question"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      ) : (
        <div className="flex-shrink-0 w-12 h-12" />
      )}
    </div>
  );
}
