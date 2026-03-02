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

export default function MilestonesPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    milestones,
    setMilestone,
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
          setOptions(result.data.enums.milestoneTypes);
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

    milestones.forEach((selection, optionId) => {
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    staleEntries.forEach(optionId => {
      setMilestone(optionId, null);
    });
  }, [options, milestones, setMilestone]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(9);
      markStepComplete(8);
      router.push('/onboarding/growth-areas');
    }
  };

  const handleBack = () => {
    setCurrentStep(7);
    router.push('/onboarding/ministry-experience');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = milestones.size;
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
      stepNumber={8}
      totalSteps={19}
      title="Select the moments that marked your journey (up to 6)."
      stepTitle="Spiritual Milestones"
      description="These are sacred—share only what feels right. You can always add more later."
      quote="I will remember the deeds of the Lord; yes, I will remember your miracles of long ago. — Psalm 77:11"
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
        selections={milestones}
        onSelectionChange={(optionId, selection) => {
          setMilestone(optionId, selection);
        }}
        sliderLabels={{
          1: 'Recent',
          2: 'Defining',
          3: 'Integrated',
          4: 'Testimony',
          5: 'Foundational',
        }}
        proficiencyDescriptions={{
          1: 'This happened recently; I am still processing the immediate impact.',
          2: 'This moment fundamentally changed my perspective or direction.',
          3: "I have found God's purpose in this moment and it is now part of my story.",
          4: 'I am now able to share this journey to encourage and strengthen others.',
          5: 'This is a core pillar of my faith; I lead and serve out of this experience.',
        }}
        proficiencyColors={{
          1: {
            color: 'bg-cyan-300 text-white',
            border: 'border-cyan-300',
            shadow: 'shadow-[0_0_12px_rgba(103,232,249,0.35)]',
            textColor: 'text-cyan-600',
          },
          2: {
            color: 'bg-cyan-400 text-white',
            border: 'border-cyan-400',
            shadow: 'shadow-[0_0_12px_rgba(34,211,238,0.35)]',
            textColor: 'text-cyan-700',
          },
          3: {
            color: 'bg-teal-600 text-white',
            border: 'border-teal-600',
            shadow: 'shadow-[0_0_12px_rgba(13,148,136,0.35)]',
            textColor: 'text-teal-800',
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
        sensitivityLevel="MEDIUM"
        defaultPrivacy="PRIVATE"
        maxSelections={6}
        customSectionLabel="MY MILESTONES"
        customButtonLabel="Add"
          customInputPlaceholder="Type your milestone..."
      />
    </OnboardingStep>
  );
}
