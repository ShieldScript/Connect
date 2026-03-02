'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStep, CategoryGridLayerStep } from '@/components/onboarding';
import { Loader2 } from 'lucide-react';
import { useReviewMode } from '@/hooks/useReviewMode';

interface EnumOption {
  value: string;
  label: string;
  category?: string;
}

export default function LifeStagesPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    lifeStages,
    setLifeStage,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  const [options, setOptions] = useState<EnumOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/onboarding/data');
        const result = await response.json();

        if (result.success) {
          setOptions(result.data.enums.lifeStageTypes);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Cleanup stale selections
  useEffect(() => {
    if (options.length === 0) return;

    const validOptionIds = new Set(options.map(opt => opt.value));
    const staleEntries: string[] = [];

    lifeStages.forEach((selection, optionId) => {
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    staleEntries.forEach(optionId => {
      setLifeStage(optionId, null);
    });
  }, [options, lifeStages, setLifeStage]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(12);
      markStepComplete(11);
      router.push('/onboarding/callings');
    }
  };

  const handleBack = () => {
    setCurrentStep(10);
    router.push('/onboarding/leadership-patterns');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = lifeStages.size;
  const isValid = selectedCount > 0;
  const buttonText = selectedCount === 0
    ? 'Select at least 1'
    : 'Continue';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <OnboardingStep
      stepNumber={11}
      totalSteps={19}
      title="Where are you in your life journey? (Up to 4)"
      stepTitle="Life Stages"
      description="This helps connect you with others in similar seasons."
      quote="There is a time for everything, and a season for every activity under the heavens. — Ecclesiastes 3:1"
      skippable={!fromReview}
      onNext={handleNext}
      onBack={getBackHandler(handleBack)}
      onSkip={handleSkip}
      nextButtonDisabled={!isValid}
      nextButtonText={getNextButtonText(buttonText)}
      selectedActivitiesCount={selectedCount}
      requiredCount={1}
      maxCount={4}
    >
      <CategoryGridLayerStep
        options={options.map((opt) => ({
          id: opt.value,
          label: opt.label,
          category: opt.category,
        }))}
        selections={lifeStages}
        onSelectionChange={(optionId, selection) => {
          setLifeStage(optionId, selection);
        }}
        sliderLabels={{
          1: 'Just Entering',
          2: 'Early Stage',
          3: 'Mid Stage',
          4: 'Late Stage',
          5: 'Transitioning Out',
        }}
        proficiencyDescriptions={{
          1: 'I am at the very start of this season, still finding my bearings.',
          2: "I'm beginning to settle into the rhythms of this new reality.",
          3: 'I am fully immersed in this season and understand its challenges.',
          4: 'I have deep experience here and am starting to look ahead.',
          5: "I am nearing the end of this season and preparing for what's next.",
        }}
        proficiencyColors={{
          1: {
            color: 'bg-teal-400 text-white',
            border: 'border-teal-400',
            shadow: 'shadow-[0_0_12px_rgba(45,212,191,0.35)]',
            textColor: 'text-teal-700',
          },
          2: {
            color: 'bg-teal-500 text-white',
            border: 'border-teal-500',
            shadow: 'shadow-[0_0_12px_rgba(20,184,166,0.35)]',
            textColor: 'text-teal-800',
          },
          3: {
            color: 'bg-teal-600 text-white',
            border: 'border-teal-600',
            shadow: 'shadow-[0_0_12px_rgba(13,148,136,0.35)]',
            textColor: 'text-teal-900',
          },
          4: {
            color: 'bg-teal-700 text-white',
            border: 'border-teal-700',
            shadow: 'shadow-[0_0_12px_rgba(15,118,110,0.35)]',
            textColor: 'text-teal-950',
          },
          5: {
            color: 'bg-amber-700 text-white',
            border: 'border-amber-700',
            shadow: 'shadow-[0_0_15px_rgba(180,83,9,0.4)]',
            textColor: 'text-amber-950',
          },
        }}
        instructionText=""
        instructionSubtext=""
        sensitivityLevel="MEDIUM"
        defaultPrivacy="PRIVATE"
        maxSelections={4}
        customSectionLabel="MY UNIQUE SEASON"
        customButtonLabel="Add"
          customInputPlaceholder="Type your season..."
      />
    </OnboardingStep>
  );
}
