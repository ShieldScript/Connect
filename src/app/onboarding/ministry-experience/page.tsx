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

export default function MinistryExperiencePage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    ministryExperiences,
    setMinistryExperience,
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
          setOptions(result.data.enums.ministryTypes);
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
    ministryExperiences.forEach((selection, optionId) => {
      // Keep custom entries (CUSTOM_timestamp) and valid enum entries
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    // Remove stale entries
    staleEntries.forEach(optionId => {
      setMinistryExperience(optionId, null);
    });
  }, [options, ministryExperiences, setMinistryExperience]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(8);
      markStepComplete(7);
      router.push('/onboarding/milestones');
    }
  };

  const handleBack = () => {
    setCurrentStep(6);
    router.push('/onboarding/supernatural-giftings');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = ministryExperiences.size;
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
      stepNumber={7}
      totalSteps={19}
      title="Select what you've served in or led (up to 8)."
      stepTitle="Ministry Experience"
      description="Identify the areas where you've invested your time and heart. You can update these as your seasons change."
      quote="Each of you should use whatever gift you have received to serve others. — 1 Peter 4:10"
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
        selections={ministryExperiences}
        onSelectionChange={(optionId, selection) => {
          setMinistryExperience(optionId, selection);
        }}
        sliderLabels={{
          1: 'Exposed',
          2: 'Helper',
          3: 'Consistent',
          4: 'Lead',
          5: 'Visionary',
        }}
        proficiencyDescriptions={{
          1: "I have participated in or observed this ministry but haven't served yet.",
          2: 'I have served in this area under the direction of a leader.',
          3: 'I serve regularly in this ministry and understand the core responsibilities.',
          4: 'I have experience overseeing a team or a specific project within this ministry.',
          5: 'I have helped build, launch, or strategically direct this ministry area.',
        }}
        proficiencyColors={{
          1: {
            color: 'bg-green-400 text-white',
            border: 'border-green-400',
            shadow: 'shadow-[0_0_12px_rgba(74,222,128,0.35)]',
            textColor: 'text-green-700',
          },
          2: {
            color: 'bg-green-500 text-white',
            border: 'border-green-500',
            shadow: 'shadow-[0_0_12px_rgba(34,197,94,0.35)]',
            textColor: 'text-green-800',
          },
          3: {
            color: 'bg-teal-500 text-white',
            border: 'border-teal-500',
            shadow: 'shadow-[0_0_12px_rgba(20,184,166,0.35)]',
            textColor: 'text-teal-800',
          },
          4: {
            color: 'bg-emerald-600 text-white',
            border: 'border-emerald-600',
            shadow: 'shadow-[0_0_12px_rgba(5,150,105,0.35)]',
            textColor: 'text-emerald-900',
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
        customSectionLabel="MY ROLES"
        customButtonLabel="Add"
          customInputPlaceholder="Type your role..."
      />
    </OnboardingStep>
  );
}
