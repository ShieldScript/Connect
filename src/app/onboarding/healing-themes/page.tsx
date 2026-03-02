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

export default function HealingThemesPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();
  const {
    healingThemes,
    setHealingTheme,
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
          setOptions(result.data.enums.healingThemeTypes);
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

    healingThemes.forEach((selection, optionId) => {
      if (!optionId.startsWith('CUSTOM_') && !validOptionIds.has(optionId)) {
        staleEntries.push(optionId);
      }
    });

    staleEntries.forEach(optionId => {
      setHealingTheme(optionId, null);
    });
  }, [options, healingThemes, setHealingTheme]);

  const handleNext = () => {
    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(14);
      markStepComplete(13);
      router.push('/onboarding/practices');
    }
  };

  const handleBack = () => {
    setCurrentStep(12);
    router.push('/onboarding/callings');
  };

  const handleSkip = () => {
    handleNext();
  };

  // State-switching button logic
  const selectedCount = healingThemes.size;
  const isValid = true; // Always valid since optional
  const buttonText = 'Continue';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <OnboardingStep
      stepNumber={13}
      totalSteps={19}
      title="What themes are you currently navigating? (Optional, Up to 5)"
      stepTitle="Healing Seasons"
      description="Trust your pace—you can refine these at any time."
      quote="He heals the brokenhearted and binds up their wounds. — Psalm 147:3"
      skippable={!fromReview}
      onNext={handleNext}
      onBack={getBackHandler(handleBack)}
      onSkip={handleSkip}
      nextButtonDisabled={!isValid}
      nextButtonText={getNextButtonText(buttonText)}
      selectedActivitiesCount={selectedCount}
      requiredCount={0}
      maxCount={5}
      showPrivacyBadge={true}
    >
      <CategoryGridLayerStep
        options={options.map((opt) => ({
          id: opt.value,
          label: opt.label,
          category: opt.category,
        }))}
        selections={healingThemes}
        onSelectionChange={(optionId, selection) => {
          setHealingTheme(optionId, selection);
        }}
        sliderLabels={{
          1: 'Acknowledging',
          2: 'Processing',
          3: 'Tending',
          4: 'Integrating',
          5: 'Restored',
        }}
        proficiencyDescriptions={{
          1: 'I am identifying this area as a place that needs care and attention.',
          2: 'I am actively working through the pain and learning new ways to cope.',
          3: 'I am consistently showing up for myself in this area and seeing growth.',
          4: 'The healing is becoming a part of my story, no longer defining my present.',
          5: 'This area is now a source of strength and empathy for others.',
        }}
        proficiencyColors={{
          1: {
            color: 'bg-purple-400 text-white',
            border: 'border-purple-400',
            shadow: 'shadow-[0_0_12px_rgba(192,132,252,0.35)]',
            textColor: 'text-purple-700',
          },
          2: {
            color: 'bg-purple-500 text-white',
            border: 'border-purple-500',
            shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.35)]',
            textColor: 'text-purple-800',
          },
          3: {
            color: 'bg-purple-600 text-white',
            border: 'border-purple-600',
            shadow: 'shadow-[0_0_12px_rgba(147,51,234,0.35)]',
            textColor: 'text-purple-900',
          },
          4: {
            color: 'bg-purple-700 text-white',
            border: 'border-purple-700',
            shadow: 'shadow-[0_0_12px_rgba(126,34,206,0.35)]',
            textColor: 'text-purple-950',
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
        maxSelections={5}
        customSectionLabel="MY HEALING JOURNEY"
        customButtonLabel="Add"
          customInputPlaceholder="Type your healing theme..."
        allowedPrivacyLevels={['PRIVATE']}
      />
    </OnboardingStep>
  );
}
