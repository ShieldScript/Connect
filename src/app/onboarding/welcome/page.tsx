'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { User, Shield, Lock, ArrowRight, Anchor, CheckCircle, Heart, BookOpen, Calendar, Dna, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { setCurrentStep, markStepComplete } = useOnboardingStore();

  const handleBegin = () => {
    setCurrentStep(2);
    markStepComplete(1);
    router.push('/onboarding/identity');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-8">
          {/* Hero Section: An Invitation to be Known */}
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Welcome to Your Stewardship Journey
            </h1>

            {/* The Invitation */}
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Brotherhood Connect is more than a directory; it is a space for intentional connection and spiritual growth. We believe every man is a steward of his story, his giftings, and his calling. We invite you to complete your <strong className="text-indigo-700">Spiritual Resume</strong>—a reflection of how God has equipped you for this season.
              </p>

              {/* The Anchor Verse */}
              <p className="text-base text-gray-500 italic font-serif">
                "As iron sharpens iron, so one person sharpens another." — Proverbs 27:17
              </p>
            </div>
          </div>

          {/* Why Complete the Journey? (Value Proposition) */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Why Complete the Journey?
            </h2>

            {/* Sidebar Cards with Theme Colors */}
            <div className="space-y-3">
              {/* Identity Card */}
              <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-blue-500 p-5 flex items-start gap-4">
                <User className="w-6 h-6 text-blue-600 stroke-[2px] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Be Found</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Help brothers in your region find you based on shared life stages and location.
                  </p>
                </div>
              </div>

              {/* Giftings Card */}
              <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-indigo-500 p-5 flex items-start gap-4">
                <Shield className="w-6 h-6 text-indigo-600 stroke-[2px] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Be Useful</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Discover where your unique talents meet the needs of the brotherhood.
                  </p>
                </div>
              </div>

              {/* Privacy Card */}
              <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-purple-500 p-5 flex items-start gap-4">
                <Lock className="w-6 h-6 text-purple-600 stroke-[2px] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Be Safe</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Control exactly who sees your sensitive journey themes with granular privacy settings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* The Five Pillars of Your Journey */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Anchor className="w-8 h-8 text-amber-700 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 mb-2">
                    Your Goal: A Complete Spiritual Resume
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Your journey unfolds in <strong>5 stages</strong> and culminates in <strong>3 commitment steps</strong>. At the end, you'll have a completed Spiritual Resume ready to share—including your personality profile, core strengths, ministry experience, and areas where you're seeking growth.
                  </p>
                </div>
              </div>

              {/* Visual Progress Path - Five Pillars */}
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-6 right-6 h-0.5 bg-amber-300"></div>

                {/* Five Pillar Nodes */}
                <div className="relative flex justify-between items-start">
                  {/* Pillar 1 - Active Step (Solid Gold Fill with Ripple Effect) */}
                  <div className="flex flex-col items-center max-w-[80px]">
                    <div className="relative mb-2 w-10 h-10">
                      {/* Single Ripple Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-amber-500 animate-[ripple_3s_ease-out_infinite]"></div>

                      {/* Main Node */}
                      <div className="relative w-10 h-10 rounded-full bg-amber-500 border-2 border-amber-500 flex items-center justify-center z-10 shadow-md">
                        <User className="w-4 h-4 text-white stroke-[2.5px]" />
                      </div>
                    </div>
                    <p className="text-xs text-amber-800 text-center font-medium leading-tight">
                      Identity
                    </p>
                  </div>

                  {/* Pillar 2 - Future Step (Outlined) */}
                  <div className="flex flex-col items-center max-w-[80px]">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center mb-2 relative z-10">
                      <Shield className="w-4 h-4 text-amber-600 stroke-[2.5px]" />
                    </div>
                    <p className="text-xs text-amber-800 text-center font-medium leading-tight">
                      Stewardship
                    </p>
                  </div>

                  {/* Pillar 3 - Future Step (Outlined) */}
                  <div className="flex flex-col items-center max-w-[80px]">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center mb-2 relative z-10">
                      <BookOpen className="w-4 h-4 text-amber-600 stroke-[2.5px]" />
                    </div>
                    <p className="text-xs text-amber-800 text-center font-medium leading-tight">
                      Rhythms
                    </p>
                  </div>

                  {/* Pillar 4 - DNA Discovery (Outlined Pink) */}
                  <div className="flex flex-col items-center max-w-[80px]">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-pink-500 flex items-center justify-center mb-2 relative z-10">
                      <Dna className="w-4 h-4 text-pink-600 stroke-[2.5px]" />
                    </div>
                    <p className="text-xs text-pink-800 text-center font-medium leading-tight">
                      DNA Discovery
                    </p>
                  </div>

                  {/* Pillar 5 - Commitment (Outlined Purple) */}
                  <div className="flex flex-col items-center max-w-[80px]">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center mb-2 relative z-10">
                      <Sparkles className="w-4 h-4 text-purple-600 stroke-[2.5px]" />
                    </div>
                    <p className="text-xs text-purple-800 text-center font-medium leading-tight">
                      Commitment
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-amber-700 text-center italic pt-2 border-t border-amber-200">
                💡 You can skip optional sections and update your profile anytime
              </p>
            </div>
          </div>

          {/* The "Pre-Flight" Card: Dual-Card Comparison */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
              What's Visible vs. Private?
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* The Community Profile (Amber Left Border) */}
              <div className="bg-[#F9FAFB] rounded-xl border-l-4 border-l-amber-500 border border-gray-200 p-5 flex flex-col">
                <h4 className="text-sm font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 stroke-[2.5px]" />
                  Shareable with Brothers
                </h4>
                <div className="space-y-3 flex-1">
                  {/* Identity */}
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-amber-600 stroke-[2.5px] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Identity</p>
                      <p className="text-xs text-gray-600">Who you are, where you live, your interests</p>
                    </div>
                  </div>

                  {/* DNA & Stewardship */}
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-amber-600 stroke-[2.5px] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">DNA & Stewardship</p>
                      <p className="text-xs text-gray-600">Your personality, gifts, and callings</p>
                    </div>
                  </div>

                  {/* Rhythms & Practices */}
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-amber-600 stroke-[2.5px] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Rhythms</p>
                      <p className="text-xs text-gray-600">Your spiritual practices and growth areas</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-amber-700 mt-4 pt-3 border-t border-gray-300 italic">
                  What brothers use to find and connect with you
                </p>
              </div>

              {/* The Personal Vault (Purple Left Border) */}
              <div className="bg-[#F9FAFB] rounded-xl border-l-4 border-l-purple-500 border border-gray-200 p-5 flex flex-col">
                <h4 className="text-sm font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600 stroke-[2.5px]" />
                  Always Private
                </h4>
                <div className="space-y-3 flex-1">
                  {/* Healing & Boundaries - Combined */}
                  <div className="flex items-start gap-3">
                    <Heart className="w-4 h-4 text-purple-600 stroke-[2.5px] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Healing & Boundaries</p>
                      <p className="text-xs text-purple-800">Your personal growth journey and capacity limits</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-purple-700 mt-4 pt-3 border-t border-gray-300 italic">
                  Your private space for reflection and capacity management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <footer className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Privacy Badge */}
            <div className="flex items-center gap-2 text-gray-500">
              <Lock className="w-4 h-4" />
              <p className="text-sm">
                Your data is secure and under your control
              </p>
            </div>

            {/* Right Side - Action Button */}
            <button
              type="button"
              onClick={handleBegin}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <span>Begin My Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
