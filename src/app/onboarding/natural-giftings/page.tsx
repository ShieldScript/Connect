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

export default function NaturalGiftingsPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    naturalGiftings,
    setNaturalGifting,
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
          setOptions(result.data.enums.giftingTypes);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Cleanup stale selections that no longer exist in options
  useEffect(() => {
    if (options.length === 0) return;

    const validOptionIds = new Set(options.map(opt => opt.value));
    const staleEntries: string[] = [];

    // Find selections that don't match current options
    naturalGiftings.forEach((selection, optionId) => {
      // Keep custom entries (CUSTOM_timestamp) and valid enum entries
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    // Remove stale entries
    staleEntries.forEach(optionId => {
      setNaturalGifting(optionId, null);
    });
  }, [options, naturalGiftings, setNaturalGifting]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(6);
      markStepComplete(5);
      router.push('/onboarding/supernatural-giftings');
    }
  };

  const handleBack = () => {
    setCurrentStep(4);
    router.push('/onboarding/interests');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = naturalGiftings.size;
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
      stepNumber={5}
      totalSteps={19}
      title="Select the patterns that resonate most (up to 8)."
      stepTitle="Natural Giftings"
      description="Trust your first instinct—this is a living profile that you can refine as you grow."
      quote="We have different gifts, according to the grace given to each of us. — Romans 12:6"
      skippable={!fromReview}
      onNext={handleNext}
      onBack={getBackHandler(handleBack)}
      onSkip={handleSkip}
      nextButtonDisabled={!isValid}
      nextButtonText={getNextButtonText(buttonText)}
      selectedActivitiesCount={selectedCount}
      requiredCount={1}
      maxCount={8}
    >
      <CategoryGridLayerStep
        options={options.map((opt) => ({
          id: opt.value,
          label: opt.label,
          category: opt.category,
        }))}
        selections={naturalGiftings}
        onSelectionChange={(optionId, selection) => {
          setNaturalGifting(optionId, selection);
        }}
        sliderLabels={{
          1: 'Latent',
          2: 'Developing',
          3: 'Fluent',
          4: 'Mastery',
          5: 'Core Strength',
        }}
        proficiencyDescriptions={{
          1: 'I recognize this ability in myself but have not yet developed it.',
          2: 'I am actively working to grow and refine this skill.',
          3: 'I can reliably use this ability and others recognize it in me.',
          4: 'I have deep proficiency and can mentor others in this area.',
          5: 'This is a defining strength; it shapes how I serve and lead.',
        }}
        proficiencyColors={{
          1: {
            color: 'bg-sky-300 text-white',
            border: 'border-sky-300',
            shadow: 'shadow-[0_0_12px_rgba(125,211,252,0.35)]',
            textColor: 'text-sky-600',
          },
          2: {
            color: 'bg-sky-400 text-white',
            border: 'border-sky-400',
            shadow: 'shadow-[0_0_12px_rgba(56,189,248,0.35)]',
            textColor: 'text-sky-700',
          },
          3: {
            color: 'bg-blue-600 text-white',
            border: 'border-blue-600',
            shadow: 'shadow-[0_0_12px_rgba(37,99,235,0.35)]',
            textColor: 'text-blue-800',
          },
          4: {
            color: 'bg-blue-700 text-white',
            border: 'border-blue-700',
            shadow: 'shadow-[0_0_12px_rgba(29,78,216,0.35)]',
            textColor: 'text-blue-900',
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
        maxSelections={8}
        customSectionLabel="MY NATURAL GIFTS"
        customButtonLabel="Add"
        customInputPlaceholder="Type your gift..."
      />
    </OnboardingStep>
  );
}
