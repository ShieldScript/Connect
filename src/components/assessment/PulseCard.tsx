'use client';

import { HexacoQuestion } from '@/data/hexacoQuestions';

interface PulseCardProps {
  question: HexacoQuestion;
  currentAnswer?: number;
  onAnswer: (score: 1 | 2 | 3 | 4 | 5) => void;
  isExiting: boolean;
}

const RESPONSE_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export default function PulseCard({ question, currentAnswer, onAnswer, isExiting }: PulseCardProps) {
  return (
    <div
      className={`
        max-w-4xl mx-auto
        ${isExiting ? 'animate-out slide-out-to-left fade-out duration-200' : 'animate-in slide-in-from-right fade-in duration-300'}
      `}
    >
      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 space-y-8">
        {/* Question Text */}
        <p className="text-2xl font-semibold text-gray-900 leading-relaxed text-center min-h-[80px] flex items-center justify-center">
          {question.text}
        </p>

        {/* Segmented Response Bar */}
        <div className="space-y-4">
          {/* Labels Row */}
          <div className="flex items-center justify-between px-2">
            {RESPONSE_OPTIONS.map((option) => (
              <div
                key={`label-${option.value}`}
                className="text-xs font-medium text-gray-500 text-center w-[18%]"
              >
                {option.label}
              </div>
            ))}
          </div>

          {/* Segmented Input Bar */}
          <div className="relative bg-gray-100 rounded-full p-1.5 shadow-inner">
            <div className="flex gap-1">
              {RESPONSE_OPTIONS.map((option) => {
                const isSelected = currentAnswer === option.value;
                const isHovered = false; // You can add hover state if needed

                return (
                  <button
                    key={option.value}
                    onClick={() => onAnswer(option.value as 1 | 2 | 3 | 4 | 5)}
                    className={`
                      flex-1 py-5 rounded-full font-bold text-lg
                      transition-all duration-300 ease-out
                      ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105 z-10'
                          : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-102 hover:shadow-md'
                      }
                    `}
                  >
                    {option.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* End Labels */}
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 px-2">
            <span>Disagree</span>
            <span>Agree</span>
          </div>
        </div>

        {/* Helper Text */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-500 italic">
            Select the number that best represents your natural response
          </p>
        </div>
      </div>
    </div>
  );
}
