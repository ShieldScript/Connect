'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStep } from '@/components/onboarding';
import {
  User, MapPin, Sparkles, Shield, Heart, Users as UsersIcon,
  BookOpen, Target, TrendingUp, Calendar, Compass, Heart as HeartIcon,
  Clock, Lock, Edit, Loader2, Dna, Anchor
} from 'lucide-react';
import { INTEREST_LABELS } from '@/../../prisma/enums/interestTypes';

export default function ReviewPage() {
  const router = useRouter();
  const store = useOnboardingStore();

  const handleBack = () => {
    store.setCurrentStep(16);
    router.push('/onboarding/boundaries');
  };

  const handleNext = () => {
    store.setCurrentStep(18);
    router.push('/onboarding/dna-reveal');
  };

  // Helper to count gold anchors (level 5)
  const countGoldAnchors = (map: Map<string, any>) => {
    return Array.from(map.values()).filter(v => v.level === 5 || v.proficiency === 5).length;
  };

  // Helper to format enum key to readable label
  const formatLabel = (key: string) => {
    // Skip UUIDs (activity IDs are UUIDs)
    if (key.includes('-') && key.length > 30) {
      return null; // Will be filtered out
    }

    // Skip numeric IDs or invalid keys
    if (/^\d+$/.test(key)) {
      return null; // Pure numbers - invalid
    }

    // Skip if it doesn't look like a valid enum key (no letters)
    if (!/[A-Z_]/.test(key)) {
      return null;
    }

    if (key.startsWith('CUSTOM_')) {
      return key.replace('CUSTOM_', '').split('_').map(word =>
        word.charAt(0) + word.slice(1).toLowerCase()
      ).join(' ');
    }
    return key.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Helper to get gold anchors and regular items
  const getItemsBreakdown = (map: Map<string, any>, isInterestMap = false) => {
    const goldItems: string[] = [];
    const regularItems: string[] = [];

    map.forEach((value, key) => {
      const level = value.level || 0;

      let label = '';

      if (isInterestMap) {
        // For interests, use INTEREST_LABELS enum
        label = value.customValue || INTEREST_LABELS[key] || '';
      } else {
        label = value.customValue || formatLabel(key) || '';

        // Defensive: strip any numeric suffixes (e.g., "Problem Solving, 1772170456039" → "Problem Solving")
        if (label) {
          label = label.replace(/,?\s*\d{10,}\s*$/g, '').trim();
        }
      }

      // Skip if no valid label
      if (!label) return;

      if (level === 5) {
        goldItems.push(label);
      } else {
        regularItems.push(label);
      }
    });

    return { goldItems, regularItems };
  };

  const sections = [
    {
      icon: User,
      title: 'Identity',
      route: '/onboarding/identity',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-600',
      items: [
        { label: 'Name', value: store.displayName },
        { label: 'Bio', value: store.bio || 'Not provided' },
      ],
    },
    {
      icon: MapPin,
      title: 'Location',
      route: '/onboarding/location',
      borderColor: 'border-emerald-500',
      iconColor: 'text-emerald-600',
      items: [
        { label: 'Community', value: store.community || 'Not specified' },
        { label: 'City', value: store.city },
        { label: 'Region', value: store.region },
      ],
    },
    {
      icon: Sparkles,
      title: 'Activities',
      route: '/onboarding/interests',
      borderColor: 'border-amber-500',
      iconColor: 'text-amber-600',
      count: store.interests.size,
      goldAnchors: countGoldAnchors(store.interests),
    },
    {
      icon: Dna,
      title: 'DNA Discovery',
      route: '/onboarding/hexaco-60',
      borderColor: 'border-pink-500',
      iconColor: 'text-pink-600',
      items: [
        {
          label: 'HEXACO-60 Assessment',
          value: store.hexacoResponses.size === 60 ? '✓ Complete' : `${store.hexacoResponses.size}/60 questions`,
        },
        {
          label: 'Status',
          value: store.hexacoResponses.size === 60 ? 'Ready for analysis' : 'Incomplete',
        },
      ],
    },
    {
      icon: Shield,
      title: 'Natural Giftings',
      route: '/onboarding/natural-giftings',
      borderColor: 'border-indigo-500',
      iconColor: 'text-indigo-600',
      count: store.naturalGiftings.size,
      goldAnchors: countGoldAnchors(store.naturalGiftings),
      hidden: store.naturalGiftings.size === 0,
    },
    {
      icon: Heart,
      title: 'Supernatural Giftings',
      route: '/onboarding/supernatural-giftings',
      borderColor: 'border-purple-500',
      iconColor: 'text-purple-600',
      count: store.supernaturalGiftings.size,
      goldAnchors: countGoldAnchors(store.supernaturalGiftings),
      hidden: store.supernaturalGiftings.size === 0,
    },
    {
      icon: UsersIcon,
      title: 'Ministry Experience',
      route: '/onboarding/ministry-experience',
      borderColor: 'border-sky-500',
      iconColor: 'text-sky-600',
      count: store.ministryExperiences.size,
      goldAnchors: countGoldAnchors(store.ministryExperiences),
      hidden: store.ministryExperiences.size === 0,
    },
    {
      icon: Target,
      title: 'Spiritual Milestones',
      route: '/onboarding/milestones',
      borderColor: 'border-teal-500',
      iconColor: 'text-teal-600',
      count: store.milestones.size,
      goldAnchors: countGoldAnchors(store.milestones),
      hidden: store.milestones.size === 0,
    },
    {
      icon: TrendingUp,
      title: 'Areas of Growth',
      route: '/onboarding/growth-areas',
      borderColor: 'border-green-500',
      iconColor: 'text-green-600',
      count: store.growthAreas.size,
      goldAnchors: countGoldAnchors(store.growthAreas),
      hidden: store.growthAreas.size === 0,
    },
    {
      icon: UsersIcon,
      title: 'Leadership Patterns',
      route: '/onboarding/leadership-patterns',
      borderColor: 'border-blue-600',
      iconColor: 'text-blue-700',
      count: store.leadershipPatterns.size,
      goldAnchors: countGoldAnchors(store.leadershipPatterns),
      hidden: store.leadershipPatterns.size === 0,
    },
    {
      icon: Calendar,
      title: 'Life Stages',
      route: '/onboarding/life-stages',
      borderColor: 'border-orange-500',
      iconColor: 'text-orange-600',
      count: store.lifeStages.size,
      goldAnchors: countGoldAnchors(store.lifeStages),
      hidden: store.lifeStages.size === 0,
    },
    {
      icon: Compass,
      title: 'Calling Trajectories',
      route: '/onboarding/callings',
      borderColor: 'border-cyan-500',
      iconColor: 'text-cyan-600',
      count: store.callings.size,
      goldAnchors: countGoldAnchors(store.callings),
      hidden: store.callings.size === 0,
    },
    {
      icon: HeartIcon,
      title: 'Healing Seasons',
      route: '/onboarding/healing-themes',
      borderColor: 'border-purple-600',
      iconColor: 'text-purple-700',
      count: store.healingThemes.size,
      goldAnchors: countGoldAnchors(store.healingThemes),
      isPrivate: true,
      hidden: false, // Always show private sections
    },
    {
      icon: BookOpen,
      title: 'Rhythms & Practices',
      route: '/onboarding/practices',
      borderColor: 'border-rose-500',
      iconColor: 'text-rose-600',
      count: store.practices.size,
      goldAnchors: countGoldAnchors(store.practices),
      hidden: store.practices.size === 0,
    },
    {
      icon: Clock,
      title: 'Boundaries & Availability',
      route: '/onboarding/boundaries',
      borderColor: 'border-stone-500',
      iconColor: 'text-stone-600',
      count: store.boundaries.size,
      goldAnchors: countGoldAnchors(store.boundaries),
      isPrivate: true,
      hidden: false, // Always show private sections
    },
  ];

  return (
    <OnboardingStep
      stepNumber={17}
      totalSteps={19}
      title="Review Your Spiritual Resume"
      description="Review your responses across all four pillars to ensure everything accurately reflects who you are and how God has wired you."
      quote="I can do all things through Christ who strengthens me. — Philippians 4:13"
      onNext={handleNext}
      onBack={handleBack}
      nextButtonText="Continue to DNA Reveal"
      nextButtonDisabled={false}
    >
      <div className="space-y-6">
        {/* Summary Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {sections.filter(s => !s.hidden).map((section) => {
            const Icon = section.icon;
            const hasGoldAnchors = (section.goldAnchors || 0) > 0;

            // Get breakdown for data sections
            let goldItems: string[] = [];
            let regularItems: string[] = [];
            const isInterestsSection = section.title === 'Activities';

            if (!section.items && section.count > 0) {
              const dataMap = isInterestsSection ? store.interests :
                section.title === 'Natural Giftings' ? store.naturalGiftings :
                section.title === 'Supernatural Giftings' ? store.supernaturalGiftings :
                section.title === 'Ministry Experience' ? store.ministryExperiences :
                section.title === 'Spiritual Milestones' ? store.milestones :
                section.title === 'Areas of Growth' ? store.growthAreas :
                section.title === 'Leadership Patterns' ? store.leadershipPatterns :
                section.title === 'Life Stages' ? store.lifeStages :
                section.title === 'Calling Trajectories' ? store.callings :
                section.title === 'Healing Seasons' ? store.healingThemes :
                section.title === 'Rhythms & Practices' ? store.practices :
                section.title === 'Boundaries & Availability' ? store.boundaries :
                new Map();

              const breakdown = getItemsBreakdown(dataMap, isInterestsSection);
              goldItems = breakdown.goldItems;
              regularItems = breakdown.regularItems;
            }

            return (
              <div
                key={section.title}
                className={`
                  relative p-4 rounded-xl border-l-2 ${section.borderColor}
                  ${section.isPrivate ? 'bg-gray-100/70' : 'bg-gray-50/50'}
                  transition-all duration-200
                `}
              >
                {/* Header with Sidebar Icon */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${section.iconColor} stroke-[2px] flex-shrink-0`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{section.title}</h3>
                        {section.isPrivate && (
                          <Lock className="w-3.5 h-3.5 text-purple-600" />
                        )}
                      </div>
                      {section.isPrivate && (
                        <p className="text-xs text-purple-600 mt-0.5">Visible only to you</p>
                      )}
                    </div>
                  </div>

                  {/* Ghost Edit Button */}
                  <button
                    onClick={() => router.push(`${section.route}?from=review`)}
                    className={`text-gray-400 ${section.iconColor.replace('text-', 'hover:text-')} transition-colors p-1 hover:bg-gray-200 rounded`}
                    aria-label="Edit section"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="ml-8">
                  {section.items ? (
                    // Identity & Location cards
                    <div className="space-y-1">
                      {section.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          <span className="font-medium">{item.label}:</span> {item.value}
                        </div>
                      ))}
                    </div>
                  ) : section.count === 0 ? (
                    // Empty state for skipped sections
                    <p className="text-sm text-gray-500 italic">Not provided</p>
                  ) : (
                    // Data sections with Gold Anchors and Top 3
                    <div className="space-y-2">
                      {/* Gold Anchors */}
                      {goldItems.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-amber-800 mb-1.5 flex items-center gap-1">
                            <Anchor className="w-3 h-3" />
                            Core Strengths
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {goldItems.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-xs font-semibold text-amber-900"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Regular Items - Top 3 + More */}
                      {regularItems.length > 0 && (
                        <div>
                          {goldItems.length > 0 && (
                            <p className="text-xs font-semibold text-gray-600 mb-1">Also selected:</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {regularItems.slice(0, 3).join(', ')}
                            {regularItems.length > 3 && (
                              <span className="text-gray-500"> +{regularItems.length - 3} more</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </OnboardingStep>
  );
}
