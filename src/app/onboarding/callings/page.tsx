'use client';
export const dynamic = 'force-dynamic';

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

export default function CallingsPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    callings,
    setCalling,
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
          setOptions(result.data.enums.callingTypes);
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

    callings.forEach((selection, optionId) => {
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    staleEntries.forEach(optionId => {
      setCalling(optionId, null);
    });
  }, [options, callings, setCalling]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(13);
      markStepComplete(12);
      router.push('/onboarding/healing-themes');
    }
  };

  const handleBack = () => {
    setCurrentStep(11);
    router.push('/onboarding/life-stages');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = callings.size;
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
      stepNumber={12}
      totalSteps={19}
      title="What is God calling you toward? (Up to 5)"
      stepTitle="Calling Trajectories"
      description="Trust your heart—you can refine these as your journey unfolds."
      quote="For I know the plans I have for you, declares the Lord. — Jeremiah 29:11"
      skippable={!fromReview}
      onNext={handleNext}
      onBack={getBackHandler(handleBack)}
      onSkip={handleSkip}
      nextButtonDisabled={!isValid}
      nextButtonText={getNextButtonText(buttonText)}
      selectedActivitiesCount={selectedCount}
      requiredCount={1}
      maxCount={5}
    >
      <CategoryGridLayerStep
        options={options.map((opt) => ({
          id: opt.value,
          label: opt.label,
          category: opt.category,
        }))}
        selections={callings}
        onSelectionChange={(optionId, selection) => {
          setCalling(optionId, selection);
        }}
        sliderLabels={{
          1: 'Unclear',
          2: 'Exploring',
          3: 'Some Clarity',
          4: 'Actively Pursuing',
          5: 'Fully Aligned',
        }}
        proficiencyDescriptions={{
          1: 'I feel a pull in this direction but don\'t yet know the shape of it.',
          2: 'I am actively seeking insight and asking questions about this path.',
          3: 'I can see the outline of my calling and am starting to step into it.',
          4: 'I am consistently investing my time and energy into this specific purpose.',
          5: 'This is my \'Burnished Gold\' center; my life and actions are in total sync with this call.',
        }}
        proficiencyColors={{
          1: {
            color: 'bg-indigo-400 text-white',
            border: 'border-indigo-400',
            shadow: 'shadow-[0_0_12px_rgba(129,140,248,0.35)]',
            textColor: 'text-indigo-700',
          },
          2: {
            color: 'bg-indigo-500 text-white',
            border: 'border-indigo-500',
            shadow: 'shadow-[0_0_12px_rgba(99,102,241,0.35)]',
            textColor: 'text-indigo-800',
          },
          3: {
            color: 'bg-indigo-600 text-white',
            border: 'border-indigo-600',
            shadow: 'shadow-[0_0_12px_rgba(79,70,229,0.35)]',
            textColor: 'text-indigo-900',
          },
          4: {
            color: 'bg-indigo-700 text-white',
            border: 'border-indigo-700',
            shadow: 'shadow-[0_0_12px_rgba(67,56,202,0.35)]',
            textColor: 'text-indigo-950',
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
        sensitivityLevel="LOW"
        defaultPrivacy="PUBLIC"
        maxSelections={5}
        customSectionLabel="MY UNIQUE PATH"
        customButtonLabel="Add"
          customInputPlaceholder="Type your calling..."
      />
    </OnboardingStep>
  );
}
