'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStep } from '@/components/onboarding';
import { InterestCategorySelector } from '@/components/onboarding/InterestCategorySelector';
import { Loader2 } from 'lucide-react';
import { useReviewMode } from '@/hooks/useReviewMode';

interface EnumOption {
  value: string;
  label: string;
  category?: string;
}

export default function InterestsPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    interests,
    setInterest,
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
          setOptions(result.data.enums.interestTypes);
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
    interests.forEach((selection, optionId) => {
      // Keep custom entries (CUSTOM_timestamp) and valid enum entries
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    // Remove stale entries
    staleEntries.forEach(optionId => {
      setInterest(optionId, null);
    });
  }, [options, interests, setInterest]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(5);
      markStepComplete(4);
      router.push('/onboarding/natural-giftings');
    }
  };

  const handleBack = () => {
    setCurrentStep(3);
    router.push('/onboarding/location');
  };

  const isValid = interests.size >= 3;

  const remainingRequired = Math.max(0, 3 - interests.size);
  const nextButtonText = remainingRequired > 0
    ? `Select ${remainingRequired} more`
    : 'Continue';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading interests...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingStep
      stepNumber={4}
      totalSteps={19}
      title="What activities interest you?"
      stepTitle="Interest Areas"
      description="This helps us connect you with brothers who share your interests."
      quote="Whatever you do, work at it with all your heart, as working for the Lord. — Colossians 3:23"
      onNext={handleNext}
      onBack={getBackHandler(handleBack)}
      nextButtonDisabled={!isValid}
      nextButtonText={getNextButtonText(nextButtonText)}
      interestsCount={interests.size}
      requiredCount={3}
      maxCount={20}
    >
      <InterestCategorySelector
        options={options.map((opt) => ({
          id: opt.value,
          label: opt.label,
          category: opt.category,
        }))}
        selections={interests}
        onSelectionChange={(optionId, selection) => {
          setInterest(optionId, selection);
        }}
        maxSelections={20}
      />
    </OnboardingStep>
  );
}
