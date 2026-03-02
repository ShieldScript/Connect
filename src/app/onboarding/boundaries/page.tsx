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

export default function BoundariesPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    boundaries,
    setBoundary,
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
          setOptions(result.data.enums.boundaryTypes);
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

    boundaries.forEach((selection, optionId) => {
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    staleEntries.forEach(optionId => {
      setBoundary(optionId, null);
    });
  }, [options, boundaries, setBoundary]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(16);
      markStepComplete(15);
      router.push('/onboarding/hexaco-60');
    }
  };

  const handleBack = () => {
    setCurrentStep(14);
    router.push('/onboarding/practices');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = boundaries.size;
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
      stepNumber={15}
      totalSteps={19}
      title="How and when are you available for connection? (Up to 8)"
      stepTitle="Boundaries & Availability"
      description="Clear boundaries help build healthy relationships."
      quote="Above all else, guard your heart, for everything you do flows from it. — Proverbs 4:23"
      skippable={!fromReview}
      onNext={handleNext}
      onBack={getBackHandler(handleBack)}
      onSkip={handleSkip}
      nextButtonDisabled={!isValid}
      nextButtonText={getNextButtonText(buttonText)}
      selectedActivitiesCount={selectedCount}
      requiredCount={1}
      maxCount={8}
      showPrivacyBadge={true}
    >
      <CategoryGridLayerStep
        options={options.map((opt) => ({
          id: opt.value,
          label: opt.label,
          category: opt.category,
        }))}
        selections={boundaries}
        onSelectionChange={(optionId, selection) => {
          setBoundary(optionId, selection);
        }}
        sliderLabels={{
          1: 'Rarely',
          2: 'Occasionally',
          3: 'Regularly',
          4: 'Very Flexible',
          5: 'Primary Window',
        }}
        proficiencyDescriptions={{
          1: 'This is very seldom a window for me to connect.',
          2: 'I can sometimes make this work with enough notice.',
          3: 'This is a consistent time for my availability.',
          4: 'I have significant room here and prioritize this time.',
          5: 'This is my "Gold Anchor" time; the most reliable way to reach me.',
        }}
        categorySliderConfigs={{
          CURRENT_LOAD: {
            sliderLabels: {
              1: 'Low Impact',
              2: 'Moderate',
              3: 'Significant',
              4: 'High Priority',
              5: 'Full Capacity',
            },
            proficiencyDescriptions: {
              1: 'This is a minor part of my current schedule.',
              2: 'I balance this alongside other regular connections.',
              3: 'This takes up a large portion of my weekly rhythm.',
              4: 'This is a primary focus and limits other availability.',
              5: 'I am at my limit here; I have no new openings in this area.',
            },
          },
          SOCIAL_STYLE: {
            sliderLabels: {
              1: 'Minimal Impact',
              2: 'Minor Consideration',
              3: 'Active Factor',
              4: 'Significant Priority',
              5: 'Core Constraint',
            },
            proficiencyDescriptions: {
              1: 'This is a factor, but it rarely changes my ability to connect.',
              2: 'I keep this in mind, but I can usually work around it.',
              3: 'This consistently shapes how and when I am able to meet.',
              4: 'This is a primary filter for my connections; I plan around it.',
              5: 'This is a non-negotiable reality that dictates my current capacity.',
            },
          },
        }}
        proficiencyColors={{
          1: {
            color: 'bg-stone-400 text-white',
            border: 'border-stone-400',
            shadow: 'shadow-[0_0_12px_rgba(168,162,158,0.35)]',
            textColor: 'text-stone-700',
          },
          2: {
            color: 'bg-stone-500 text-white',
            border: 'border-stone-500',
            shadow: 'shadow-[0_0_12px_rgba(120,113,108,0.35)]',
            textColor: 'text-stone-800',
          },
          3: {
            color: 'bg-stone-600 text-white',
            border: 'border-stone-600',
            shadow: 'shadow-[0_0_12px_rgba(87,83,78,0.35)]',
            textColor: 'text-stone-900',
          },
          4: {
            color: 'bg-stone-700 text-white',
            border: 'border-stone-700',
            shadow: 'shadow-[0_0_12px_rgba(68,64,60,0.35)]',
            textColor: 'text-stone-950',
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
        maxSelections={8}
        customSectionLabel="MY UNIQUE BOUNDARIES"
        customButtonLabel="Add"
          customInputPlaceholder="Type your boundary..."
        allowedPrivacyLevels={['PRIVATE']}
      />
    </OnboardingStep>
  );
}
