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

export default function GrowthAreasPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    growthAreas,
    setGrowthArea,
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
          setOptions(result.data.enums.growthAreaTypes);
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

    growthAreas.forEach((selection, optionId) => {
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    staleEntries.forEach(optionId => {
      setGrowthArea(optionId, null);
    });
  }, [options, growthAreas, setGrowthArea]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(10);
      markStepComplete(9);
      router.push('/onboarding/leadership-patterns');
    }
  };

  const handleBack = () => {
    setCurrentStep(8);
    router.push('/onboarding/milestones');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = growthAreas.size;
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
      stepNumber={9}
      totalSteps={19}
      title="Select where you're open to partnership (up to 6)."
      stepTitle="Areas of Growth"
      description="This is a safe space—everything defaults to Private. Share only what feels right."
      quote="Not that I have already obtained all this, or have already arrived at my goal, but I press on. — Philippians 3:12"
      skippable={!fromReview}
      onNext={handleNext}
      onBack={getBackHandler(handleBack)}
      onSkip={handleSkip}
      nextButtonDisabled={!isValid}
      nextButtonText={getNextButtonText(buttonText)}
      selectedActivitiesCount={selectedCount}
      requiredCount={1}
      maxCount={6}
    >
      <CategoryGridLayerStep
        options={options.map((opt) => ({
          id: opt.value,
          label: opt.label,
          category: opt.category,
        }))}
        selections={growthAreas}
        onSelectionChange={(optionId, selection) => {
          setGrowthArea(optionId, selection);
        }}
        sliderLabels={{
          1: 'Quietly Aware',
          2: 'Exploring Help',
          3: 'Open to Mentorship',
          4: 'Actively Growing',
          5: 'Shared Journey',
        }}
        proficiencyDescriptions={{
          1: "I recognize this is a growth area for me, but I'm currently processing it privately.",
          2: 'I am starting to look for resources or advice to help me navigate this area.',
          3: 'I would welcome a mentor or partner to walk alongside me in this specific area.',
          4: 'I am consistently working on this and seeing real change in my daily life.',
          5: 'I have grown significantly here and am ready to grow alongside others or be mentored.',
        }}
        proficiencyColors={{
          1: {
            color: 'bg-slate-400 text-white',
            border: 'border-slate-400',
            shadow: 'shadow-[0_0_12px_rgba(148,163,184,0.35)]',
            textColor: 'text-slate-700',
          },
          2: {
            color: 'bg-slate-500 text-white',
            border: 'border-slate-500',
            shadow: 'shadow-[0_0_12px_rgba(100,116,139,0.35)]',
            textColor: 'text-slate-800',
          },
          3: {
            color: 'bg-slate-600 text-white',
            border: 'border-slate-600',
            shadow: 'shadow-[0_0_12px_rgba(71,85,105,0.35)]',
            textColor: 'text-slate-900',
          },
          4: {
            color: 'bg-amber-600 text-white',
            border: 'border-amber-600',
            shadow: 'shadow-[0_0_12px_rgba(217,119,6,0.35)]',
            textColor: 'text-amber-900',
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
        sensitivityLevel="HIGH"
        defaultPrivacy="PRIVATE"
        maxSelections={6}
        customSectionLabel="MY JOURNEY"
        customButtonLabel="Add"
          customInputPlaceholder="Type your growth area..."
      />
    </OnboardingStep>
  );
}
