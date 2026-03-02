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

export default function LeadershipPatternsPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    leadershipPatterns,
    setLeadershipPattern,
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
          setOptions(result.data.enums.leadershipStyles);
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

    leadershipPatterns.forEach((selection, optionId) => {
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    staleEntries.forEach(optionId => {
      setLeadershipPattern(optionId, null);
    });
  }, [options, leadershipPatterns, setLeadershipPattern]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(11);
      markStepComplete(10);
      router.push('/onboarding/life-stages');
    }
  };

  const handleBack = () => {
    setCurrentStep(9);
    router.push('/onboarding/growth-areas');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = leadershipPatterns.size;
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
      stepNumber={10}
      totalSteps={19}
      title="Which patterns describe your natural influence? (Up to 5)"
      stepTitle="Leadership Patterns"
      description="Trust your first instinct—you can refine these as you grow."
      quote="We have different gifts, according to the grace given to each of us. — Romans 12:6"
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
        selections={leadershipPatterns}
        onSelectionChange={(optionId, selection) => {
          setLeadershipPattern(optionId, selection);
        }}
        sliderLabels={{
          1: 'Emerging',
          2: 'Situational',
          3: 'Consistent',
          4: 'Natural Default',
          5: 'Proven Pattern',
        }}
        proficiencyDescriptions={{
          1: 'I am starting to recognize this pattern in my interactions with others.',
          2: 'I lead this way when the specific need or environment calls for it.',
          3: 'This is a reliable way I influence people across different areas of my life.',
          4: "This is my primary 'go-to' style; I lean into this instinctively.",
          5: 'This is a defining characteristic of my leadership that others clearly recognize.',
        }}
        proficiencyColors={{
          1: {
            color: 'bg-indigo-300 text-white',
            border: 'border-indigo-300',
            shadow: 'shadow-[0_0_12px_rgba(165,180,252,0.35)]',
            textColor: 'text-indigo-600',
          },
          2: {
            color: 'bg-indigo-400 text-white',
            border: 'border-indigo-400',
            shadow: 'shadow-[0_0_12px_rgba(129,140,248,0.35)]',
            textColor: 'text-indigo-700',
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
            color: 'bg-amber-500 text-white',
            border: 'border-amber-500',
            shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
            textColor: 'text-yellow-900',
          },
        }}
        instructionText=""
        instructionSubtext=""
        sensitivityLevel="MEDIUM"
        defaultPrivacy="GROUP"
        maxSelections={5}
        customSectionLabel="MY LEADERSHIP PATTERNS"
        customButtonLabel="Add"
        customInputPlaceholder="Type your pattern..."
      />
    </OnboardingStep>
  );
}
