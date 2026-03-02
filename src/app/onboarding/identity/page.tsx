'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStep } from '@/components/onboarding';
import { useReviewMode } from '@/hooks/useReviewMode';
import { Check } from 'lucide-react';

export default function IdentityPage() {
  const router = useRouter();
  const { fromReview, returnToReview, getBackHandler, getNextButtonText } = useReviewMode();

  const {
    displayName: storedDisplayName,
    bio: storedBio,
    setIdentity,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  const [displayName, setDisplayNameLocal] = useState(storedDisplayName);
  const [bio, setBioLocal] = useState(storedBio);

  const handleNext = () => {
    setIdentity({ displayName, bio });

    if (fromReview) {
      returnToReview();
    } else {
      setCurrentStep(3);
      markStepComplete(2);
      router.push('/onboarding/location');
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    router.push('/onboarding/welcome');
  };

  const isValid = displayName.trim().length > 0;

  return (
    <OnboardingStep
      stepNumber={2}
      totalSteps={17}
      title="Tell us about yourself"
      description="Let's start with the basics. This will help your brothers recognize and connect with you."
      quote="I have called you by name; you are mine. — Isaiah 43:1"
      onNext={handleNext}
      onBack={getBackHandler(handleBack)}
      nextButtonDisabled={!isValid}
      nextButtonText={getNextButtonText()}
      displayName={displayName}
    >
      <div className="space-y-6">
        {/* Display Name */}
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Display Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayNameLocal(e.target.value)}
              placeholder="How should we address you?"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
              required
            />
            {displayName.trim().length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This is how other members will see you (e.g., "John Smith" or "John
            M.")
          </p>
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Brief Bio <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBioLocal(e.target.value)}
            placeholder="Share a bit about yourself, your family, your work, or what you're passionate about..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 resize-none"
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              A short introduction to help others get to know you
            </p>
            <p className="text-xs text-gray-400">{bio.length}/500</p>
          </div>
        </div>

      </div>
    </OnboardingStep>
  );
}
