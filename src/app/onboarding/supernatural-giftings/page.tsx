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

export default function SupernaturalGiftingsPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    supernaturalGiftings,
    setSupernaturalGifting,
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
          setOptions(result.data.enums.supernaturalGiftTypes);
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
    supernaturalGiftings.forEach((selection, optionId) => {
      // Keep custom entries (CUSTOM_timestamp) and valid enum entries
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    // Remove stale entries
    staleEntries.forEach(optionId => {
      setSupernaturalGifting(optionId, null);
    });
  }, [options, supernaturalGiftings, setSupernaturalGifting]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(7);
      markStepComplete(6);
      router.push('/onboarding/ministry-experience');
    }
  };

  const handleBack = () => {
    setCurrentStep(5);
    router.push('/onboarding/natural-giftings');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = supernaturalGiftings.size;
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
      stepNumber={6}
      totalSteps={19}
      title="Select what you've experienced or sense (up to 8)."
      stepTitle="Supernatural Giftings"
      description="These aren't set in stone—spirituality is a journey of discovery, and you can always refine your giftings later."
      quote="Now to each one the manifestation of the Spirit is given for the common good. — 1 Corinthians 12:7"
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
        selections={supernaturalGiftings}
        onSelectionChange={(optionId, selection) => {
          setSupernaturalGifting(optionId, selection);
        }}
        sliderLabels={{
          1: 'Not Experienced',
          2: 'Emerging',
          3: 'Active',
          4: 'Consistent',
          5: 'Core Gift',
        }}
        proficiencyDescriptions={{
          1: 'I have not yet experienced this gift manifesting through me.',
          2: 'I have experienced this gift occasionally and am learning to discern it.',
          3: 'This gift operates through me regularly for the benefit of others.',
          4: 'This gift flows consistently and I can steward it with confidence.',
          5: 'This is a foundational gift; others recognize and receive from it frequently.',
        }}
        proficiencyColors={{
          1: {
            color: 'bg-purple-300 text-white',
            border: 'border-purple-300',
            shadow: 'shadow-[0_0_12px_rgba(216,180,254,0.35)]',
            textColor: 'text-purple-600',
          },
          2: {
            color: 'bg-purple-400 text-white',
            border: 'border-purple-400',
            shadow: 'shadow-[0_0_12px_rgba(192,132,252,0.35)]',
            textColor: 'text-purple-700',
          },
          3: {
            color: 'bg-purple-600 text-white',
            border: 'border-purple-600',
            shadow: 'shadow-[0_0_12px_rgba(147,51,234,0.35)]',
            textColor: 'text-purple-800',
          },
          4: {
            color: 'bg-indigo-700 text-white',
            border: 'border-indigo-700',
            shadow: 'shadow-[0_0_12px_rgba(67,56,202,0.35)]',
            textColor: 'text-indigo-900',
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
        defaultPrivacy="GROUP"
        maxSelections={8}
        customSectionLabel="MY SPIRITUAL GIFTS"
        customButtonLabel="Add"
          customInputPlaceholder="Type your gift..."
      />
    </OnboardingStep>
  );
}
