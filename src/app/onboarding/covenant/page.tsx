'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStep } from '@/components/onboarding';
import { Shield, Heart, Users, BookOpen, Check, Anchor } from 'lucide-react';

export default function CovenantPage() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [agreed, setAgreed] = useState(store.covenantAgreed);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    store.setCurrentStep(18);
    router.push('/onboarding/dna-reveal');
  };

  const handleNext = async () => {
    store.setCovenantAgreed(agreed);

    // Submit onboarding
    setIsSubmitting(true);
    setError(null);

    try {
      const data = {
        displayName: store.displayName,
        bio: store.bio,
        community: store.community,
        city: store.city,
        region: store.region,
        latitude: store.latitude,
        longitude: store.longitude,
        interests: Array.from(store.interests.entries()).map(
          ([id, selection]) => ({
            type: id,
            proficiency: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        hexacoResponses: Array.from(store.hexacoResponses.entries()).reduce(
          (acc, [qId, score]) => ({ ...acc, [qId]: score }),
          {}
        ),
        naturalGiftings: Array.from(store.naturalGiftings.entries()).map(
          ([id, selection]) => ({
            type: id,
            level: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        supernaturalGiftings: Array.from(store.supernaturalGiftings.entries()).map(
          ([id, selection]) => ({
            type: id,
            level: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        ministryExperiences: Array.from(store.ministryExperiences.entries()).map(
          ([id, selection]) => ({
            type: id,
            level: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        milestones: Array.from(store.milestones.entries()).map(
          ([id, selection]) => ({
            type: id,
            significance: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
            description: '',
          })
        ),
        growthAreas: Array.from(store.growthAreas.entries()).map(
          ([id, selection]) => ({
            type: id,
            level: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        leadershipPatterns: Array.from(store.leadershipPatterns.entries()).map(
          ([id, selection]) => ({
            style: id,
            frequency: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        lifeStages: Array.from(store.lifeStages.entries()).map(
          ([id, selection]) => ({
            type: id,
            stage: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        callings: Array.from(store.callings.entries()).map(
          ([id, selection]) => ({
            type: id,
            clarity: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        healingThemes: Array.from(store.healingThemes.entries()).map(
          ([id, selection]) => ({
            type: id,
            progress: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        practices: Array.from(store.practices.entries()).map(
          ([id, selection]) => ({
            type: id,
            frequency: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
        boundaries: Array.from(store.boundaries.entries()).map(
          ([id, selection]) => ({
            type: id,
            availability: selection.level,
            privacy: selection.privacy,
            customValue: selection.customValue,
          })
        ),
      };

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        store.reset();
        router.push('/');
      } else {
        setError(result.error || 'Failed to complete onboarding');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const covenantSections = [
    {
      key: 'RESPECT',
      icon: Shield,
      title: 'Respect & Safety',
      color: 'blue',
      borderColor: 'border-blue-500',
      iconColor: 'text-indigo-600',
      principles: [
        'Treat all members with dignity, kindness, and respect',
        'Honor confidentiality and privacy settings',
        'Report harmful behavior and maintain safe spaces',
        'Reject discrimination, harassment, and abuse of any kind',
      ],
    },
    {
      key: 'AUTHENTICITY',
      icon: Heart,
      title: 'Authenticity & Vulnerability',
      color: 'purple',
      borderColor: 'border-purple-500',
      iconColor: 'text-indigo-600',
      principles: [
        'Be genuine and honest in my interactions',
        'Create space for others to be vulnerable without judgment',
        'Seek understanding before giving advice',
        'Share struggles and victories with humility',
      ],
    },
    {
      key: 'ACCOUNTABILITY',
      icon: Users,
      title: 'Accountability & Growth',
      color: 'green',
      borderColor: 'border-emerald-500',
      iconColor: 'text-indigo-600',
      principles: [
        'Welcome loving correction and accountability',
        'Challenge and encourage others toward growth',
        'Pursue personal holiness and spiritual maturity',
        'Be consistent and faithful in my commitments',
      ],
    },
    {
      key: 'CHRIST_CENTERED',
      icon: BookOpen,
      title: 'Christ-Centered Fellowship',
      color: 'amber',
      borderColor: 'border-amber-500',
      iconColor: 'text-indigo-600',
      principles: [
        'Keep Christ at the center of all relationships',
        'Point others toward Jesus in word and deed',
        'Practice forgiveness as I have been forgiven',
        'Love others as Christ has loved me',
      ],
    },
  ];

  return (
    <OnboardingStep
      stepNumber={19}
      totalSteps={19}
      title="The Brotherhood Covenant"
      description="Your final commitment to enter the brotherhood with clarity, purpose, and covenant."
      quote="As iron sharpens iron, so one person sharpens another. — Proverbs 27:17"
      onNext={handleNext}
      onBack={handleBack}
      nextButtonText={isSubmitting ? 'Sealing Covenant...' : 'Seal Covenant & Join'}
      nextButtonDisabled={!agreed || isSubmitting}
    >
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <div className="space-y-6">
        {/* Commitment Header */}
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">
            As a member of Brotherhood Connect, I commit to:
          </h3>
        </div>

        {/* Covenant Principles - Sidebar Layout */}
        <div className="space-y-4">
          {covenantSections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.key}
                className={`flex gap-4 items-start p-4 bg-gray-50/50 rounded-xl border-l-2 ${section.borderColor}`}
              >
                {/* Left Column - Category */}
                <div className="flex items-center gap-2 w-[180px] flex-shrink-0">
                  <Icon className={`w-5 h-5 ${section.iconColor} stroke-[2px]`} />
                  <h4 className="text-sm font-bold text-gray-900 tracking-tight leading-tight">
                    {section.title}
                  </h4>
                </div>

                {/* Right Column - Principles */}
                <div className="flex-1">
                  <ul className="space-y-px">
                    {section.principles.map((principle, idx) => (
                      <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                        {principle}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Community Guidelines */}
        <div className="bg-gray-50 rounded-lg border border-gray-300 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Community Guidelines
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>No solicitation:</strong> This is not a marketplace. No selling, recruiting, or self-promotion.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Theological humility:</strong> We're a diverse brotherhood. Major on the majors, be gracious on secondary issues.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Confidentiality:</strong> What's shared in the brotherhood stays in the brotherhood, unless safety is at risk.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Conflict resolution:</strong> Address issues directly and lovingly. Follow Matthew 18 principles.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Online etiquette:</strong> Assume the best, communicate clearly, and remember there's a real brother behind every profile.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">⚠</span>
              <span><strong>Violations:</strong> We believe in restoration. Violations may result in warnings, temporary suspension, or removal, with a goal of shepherding brothers back to Christ-like conduct.</span>
            </div>
          </div>
        </div>

        {/* Agreement Section - Seal of Commitment */}
        <div className="border-2 border-indigo-200 bg-indigo-50/30 rounded-xl p-6 space-y-4">
          {/* Toggle Agreement */}
          <div className="flex items-start gap-4">
            <button
              onClick={() => setAgreed(!agreed)}
              className={`
                flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center
                transition-all duration-300
                ${
                  agreed
                    ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200'
                    : 'bg-white border-gray-300 hover:border-indigo-400'
                }
              `}
              aria-label="Agree to covenant"
            >
              {agreed && <Check className="w-5 h-5 text-white stroke-[3px]" />}
            </button>
            <div className="flex-1">
              <label
                onClick={() => setAgreed(!agreed)}
                className="cursor-pointer block"
              >
                <p className="font-semibold text-gray-900 mb-1">
                  I have read and agree to this covenant.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  I commit to upholding these principles in my interactions with my brothers, creating a safe and Christ-centered community for all members.
                </p>
              </label>

              {/* Signature Effect */}
              {agreed && (
                <div className="mt-3 pt-3 border-t border-indigo-200">
                  <p className="text-xs text-indigo-600 font-medium italic">
                    ✓ Signed: {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}
