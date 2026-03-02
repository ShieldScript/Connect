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

export default function PracticesPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    practices,
    setPractice,
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
          setOptions(result.data.enums.practiceTypes);
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

    practices.forEach((selection, optionId) => {
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    staleEntries.forEach(optionId => {
      setPractice(optionId, null);
    });
  }, [options, practices, setPractice]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(15);
      markStepComplete(14);
      router.push('/onboarding/boundaries');
    }
  };

  const handleBack = () => {
    setCurrentStep(13);
    router.push('/onboarding/healing-themes');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = practices.size;
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
      stepNumber={14}
      totalSteps={19}
      title="What practices are part of your regular rhythm? (Up to 8)"
      stepTitle="Rhythms & Practices"
      description="Sharing these helps you find brothers who walk a similar path."
      quote="But when you pray, go into your room, close the door and pray to your Father. — Matthew 6:6"
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
        selections={practices}
        onSelectionChange={(optionId, selection) => {
          setPractice(optionId, selection);
        }}
        sliderLabels={{
          1: 'Occasional',
          2: 'Regular',
          3: 'Consistent',
          4: 'Natural Default',
          5: 'Proven Pattern',
        }}
        proficiencyDescriptions={{
          1: 'I participate in this practice every once in a while.',
          2: 'I am building a steady rhythm with this practice.',
          3: 'This is a reliable part of my weekly or daily life.',
          4: 'This practice is deeply ingrained in how I live and think.',
          5: 'This is a core strength; a rhythm that has weathered many seasons.',
        }}
        proficiencyColors={{
          1: {
            color: 'bg-blue-400 text-white',
            border: 'border-blue-400',
            shadow: 'shadow-[0_0_12px_rgba(96,165,250,0.35)]',
            textColor: 'text-blue-700',
          },
          2: {
            color: 'bg-blue-500 text-white',
            border: 'border-blue-500',
            shadow: 'shadow-[0_0_12px_rgba(59,130,246,0.35)]',
            textColor: 'text-blue-800',
          },
          3: {
            color: 'bg-blue-600 text-white',
            border: 'border-blue-600',
            shadow: 'shadow-[0_0_12px_rgba(37,99,235,0.35)]',
            textColor: 'text-blue-900',
          },
          4: {
            color: 'bg-blue-700 text-white',
            border: 'border-blue-700',
            shadow: 'shadow-[0_0_12px_rgba(29,78,216,0.35)]',
            textColor: 'text-blue-950',
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
        customSectionLabel="MY UNIQUE RHYTHMS"
        customButtonLabel="Add"
          customInputPlaceholder="Type your rhythm..."
      />
    </OnboardingStep>
  );
}
