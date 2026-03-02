'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { HEXACO_QUESTIONS, BATCH_THEMES } from '@/data/hexacoQuestions';
import { OnboardingStep } from '@/components/onboarding';
import PulseCardAssessment from '@/components/assessment/PulseCardAssessment';
import { useEffect } from 'react';

export default function HexacoAssessmentPage() {
  const router = useRouter();
  const {
    hexacoResponses,
    hexacoCurrentQuestion,
    hexacoCurrentBatch,
    setHexacoResponse,
    setHexacoCurrentQuestion,
    setHexacoCurrentBatch,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  // Update batch based on current question
  useEffect(() => {
    const newBatch = Math.floor(hexacoCurrentQuestion / 10) + 1;
    if (newBatch !== hexacoCurrentBatch) {
      setHexacoCurrentBatch(newBatch);
    }
  }, [hexacoCurrentQuestion, hexacoCurrentBatch, setHexacoCurrentBatch]);

  const handleAnswer = (questionId: number, score: 1 | 2 | 3 | 4 | 5) => {
    setHexacoResponse(questionId, score);
  };

  const handleQuestionChange = (index: number) => {
    setHexacoCurrentQuestion(index);
  };

  const handleNext = () => {
    markStepComplete(16);
    setCurrentStep(17);
    router.push('/onboarding/review');
  };

  const handleBack = () => {
    setCurrentStep(15);
    router.push('/onboarding/boundaries');
  };

  const batchTheme = BATCH_THEMES[hexacoCurrentBatch as keyof typeof BATCH_THEMES];
  const progressPercentage = Math.round((hexacoResponses.size / 60) * 100);

  return (
    <OnboardingStep
      stepNumber={16}
      totalSteps={19}
      title="DNA Discovery"
      stepTitle="DNA Discovery"
      description="Answer 60 questions to reveal your natural temperament. This HEXACO-60 assessment unlocks your personality profile."
      quote="I praise you because I am fearfully and wonderfully made. — Psalm 139:14"
      onNext={handleNext}
      onBack={handleBack}
      nextButtonDisabled={hexacoResponses.size < 60}
      nextButtonText={hexacoResponses.size < 60 ? `${hexacoResponses.size}/60 Complete` : 'Continue to Stewardship'}
      customTopBarContent={
        <div className="flex items-center gap-3">
          {/* Batch Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
            <span className="text-xs font-bold text-blue-600">
              Batch {hexacoCurrentBatch} of 6
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-gray-700">
              {batchTheme.title}
            </span>
          </div>
          {/* Completion Percentage */}
          <span className="text-xs font-bold text-emerald-600">
            {progressPercentage}% Complete
          </span>
        </div>
      }
      customFooterInfo={
        <span>Question {hexacoCurrentQuestion + 1} of 60</span>
      }
    >
      {/* Question Card */}
      <PulseCardAssessment
        questions={HEXACO_QUESTIONS}
        responses={hexacoResponses}
        currentQuestionIndex={hexacoCurrentQuestion}
        onAnswer={handleAnswer}
        onQuestionChange={handleQuestionChange}
        onComplete={handleNext}
      />
    </OnboardingStep>
  );
}
