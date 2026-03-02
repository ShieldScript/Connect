'use client';

import { BATCH_THEMES } from '@/data/hexacoQuestions';

interface PulseProgressIndicatorProps {
  currentBatch: number; // 1-6
  currentQuestion: number; // 1-60
  completedQuestions: number; // 0-60
}

export default function PulseProgressIndicator({
  currentBatch,
  currentQuestion,
  completedQuestions,
}: PulseProgressIndicatorProps) {
  const batches = [1, 2, 3, 4, 5, 6];
  const progressPercentage = (completedQuestions / 60) * 100;

  const batchTheme = BATCH_THEMES[currentBatch as keyof typeof BATCH_THEMES];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
      <div className="max-w-4xl mx-auto px-6 py-5">
        {/* Batch Theme Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 rounded-full shadow-sm border border-blue-200">
            <span className="text-xs font-bold text-blue-600">
              Batch {currentBatch} of 6
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-gray-700">
              {batchTheme.title}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">{batchTheme.subtitle}</p>
        </div>

        {/* Progress Bar with Question Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-600">
            <span>Question {currentQuestion} of 60</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>

          <div className="relative h-3 bg-white/80 rounded-full overflow-hidden shadow-inner border border-blue-100">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Batch Pills */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {batches.map((batch) => {
            const questionsInBatch = 10;
            const startQ = (batch - 1) * questionsInBatch + 1;
            const endQ = batch * questionsInBatch;
            const isCurrent = batch === currentBatch;
            const isCompleted = currentQuestion > endQ;

            return (
              <div
                key={batch}
                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center
                  font-bold text-sm transition-all duration-300
                  ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-lg scale-110 ring-4 ring-blue-200'
                      : isCompleted
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  batch
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
