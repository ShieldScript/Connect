'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { OnboardingStep } from '@/components/onboarding';
import DNARevealCard from '@/components/onboarding/DNARevealCard';
import { calculateHexacoScores, getArchetype } from '@/lib/hexacoScoring';
import { Sparkles, ArrowRight, Loader2, Zap, Sprout, Users, Briefcase, Heart, CheckCircle, TrendingUp } from 'lucide-react';

// Helper: Generate hash of data for cache invalidation
function generateDataHash(data: any): string {
  return JSON.stringify(data);
}

// Helper: Get cached analysis
function getCachedAnalysis(key: string): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

// Helper: Set cached analysis
function setCachedAnalysis(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to cache analysis:', err);
  }
}

export default function DNARevealPage() {
  const router = useRouter();
  const store = useOnboardingStore();
  const [hexacoScores, setHexacoScores] = useState<any>(null);
  const [archetype, setArchetype] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  // Pure HEXACO personality analysis
  const [hexacoAnalysis, setHexacoAnalysis] = useState<any>(null);
  const [isAnalyzingHexaco, setIsAnalyzingHexaco] = useState(false);

  // DNA alignment analysis (with stewardship)
  const [dnaAnalysis, setDnaAnalysis] = useState<any>(null);
  const [isAnalyzingDna, setIsAnalyzingDna] = useState(false);

  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (store.hexacoResponses.size === 60) {
      const scores = calculateHexacoScores(store.hexacoResponses);
      if (scores) {
        setHexacoScores(scores);
        const calculatedArchetype = getArchetype(scores);
        setArchetype(calculatedArchetype);

        // Small delay for dramatic effect
        setTimeout(() => setIsReady(true), 500);
      }
    }
  }, [store.hexacoResponses]);

  // Generate pure HEXACO personality analysis when scores are ready
  useEffect(() => {
    if (!hexacoScores || !archetype || hexacoAnalysis || isAnalyzingHexaco) return;

    const generateHexacoAnalysis = async () => {
      // Check cache first
      const cacheKey = `hexaco-analysis-${generateDataHash({ hexacoScores, archetype })}`;
      const cached = getCachedAnalysis(cacheKey);

      if (cached) {
        setHexacoAnalysis(cached);
        return;
      }

      setIsAnalyzingHexaco(true);

      try {
        const response = await fetch('/api/ai/hexaco-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hexacoScores, archetype }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          setHexacoAnalysis(result.data);
          // Cache the result
          setCachedAnalysis(cacheKey, result.data);
        }
      } catch (err) {
        console.error('HEXACO analysis error:', err);
      } finally {
        setIsAnalyzingHexaco(false);
      }
    };

    generateHexacoAnalysis();
  }, [hexacoScores, archetype, hexacoAnalysis, isAnalyzingHexaco]);

  // Generate DNA alignment analysis when scores are ready
  useEffect(() => {
    if (!hexacoScores || !archetype || dnaAnalysis || isAnalyzingDna) return;

    const generateDnaAnalysis = async () => {
      // Prepare data from store
      const data = {
        hexacoScores,
        archetype,
        naturalGiftings: Array.from(store.naturalGiftings.entries()).map(
          ([id, selection]) => ({
            type: id,
            level: selection.level,
          })
        ),
        supernaturalGiftings: Array.from(store.supernaturalGiftings.entries()).map(
          ([id, selection]) => ({
            type: id,
            level: selection.level,
          })
        ),
        ministryExperiences: Array.from(store.ministryExperiences.entries()).map(
          ([id, selection]) => ({
            type: id,
            level: selection.level,
          })
        ),
        practices: Array.from(store.practices.entries()).map(
          ([id, selection]) => ({
            type: id,
            frequency: selection.level,
          })
        ),
        leadershipPatterns: Array.from(store.leadershipPatterns.entries()).map(
          ([id, selection]) => ({
            style: id,
            frequency: selection.level,
          })
        ),
        callings: Array.from(store.callings.entries()).map(
          ([id, selection]) => ({
            type: id,
            clarity: selection.level,
          })
        ),
      };

      // Check cache first (cache key includes stewardship data, so edits invalidate)
      const cacheKey = `dna-analysis-${generateDataHash(data)}`;
      const cached = getCachedAnalysis(cacheKey);

      if (cached) {
        setDnaAnalysis(cached);
        return;
      }

      setIsAnalyzingDna(true);
      setAnalysisError(null);

      try {
        const response = await fetch('/api/ai/dna-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success && result.data) {
          setDnaAnalysis(result.data);
          // Cache the result
          setCachedAnalysis(cacheKey, result.data);
        } else {
          setAnalysisError(result.error || 'Failed to generate analysis');
        }
      } catch (err) {
        console.error('DNA analysis error:', err);
        setAnalysisError('An unexpected error occurred');
      } finally {
        setIsAnalyzingDna(false);
      }
    };

    generateDnaAnalysis();
  }, [hexacoScores, archetype, store, dnaAnalysis, isAnalyzingDna]);

  const handleBack = () => {
    store.setCurrentStep(17);
    router.push('/onboarding/review');
  };

  const handleNext = () => {
    store.setCurrentStep(19);
    router.push('/onboarding/covenant');
  };

  if (!hexacoScores || !archetype) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Sparkles className="w-12 h-12 text-purple-600 animate-pulse mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Analyzing Your DNA...</h1>
        <p className="text-gray-600 mt-2">Preparing your personality profile</p>
      </div>
    );
  }

  return (
    <OnboardingStep
      stepNumber={18}
      totalSteps={19}
      title="Your DNA Profile"
      description="Based on your HEXACO-60 assessment, here is your natural temperament and how it aligns with your gifts and calling."
      quote="For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do. — Ephesians 2:10"
      onNext={handleNext}
      onBack={handleBack}
      nextButtonText="Continue to Covenant"
      nextButtonIcon={<ArrowRight className="w-4 h-4" />}
    >
      <div className="space-y-8">
        {/* DNA Reveal Card */}
        {isReady && (
          <div className="animate-fade-in">
            <DNARevealCard
              hexacoScores={hexacoScores}
              archetype={archetype}
              isLoading={false}
            />
          </div>
        )}

        {/* Loading States */}
        {isAnalyzingHexaco && !hexacoAnalysis && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-blue-900 font-medium mb-2">
              Generating Your Personality Analysis...
            </p>
            <p className="text-sm text-blue-700">
              AI is analyzing your HEXACO temperament profile
            </p>
          </div>
        )}

        {isAnalyzingDna && !dnaAnalysis && hexacoAnalysis && (
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-purple-900 font-medium mb-2">
              Generating Your Alignment Analysis...
            </p>
            <p className="text-sm text-purple-700">
              AI is analyzing how your DNA aligns with your gifts and calling
            </p>
          </div>
        )}

        {analysisError && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <p className="text-red-900 font-medium mb-2">
              Unable to Generate Analysis
            </p>
            <p className="text-sm text-red-700">
              {analysisError}. Your profile will still be saved and you can view the analysis after joining.
            </p>
          </div>
        )}

        {/* SECTION 1: Pure HEXACO Personality Analysis */}
        {hexacoAnalysis && !isAnalyzingHexaco && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
              <h2 className="text-xl font-bold text-blue-900 tracking-tight">
                Your Personality
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            </div>

            {/* Overall Description */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-8">
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {hexacoAnalysis.overallDescription}
                </p>
              </div>
            </div>

            {/* Strengths & Growth Edges */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {hexacoAnalysis.strengths && hexacoAnalysis.strengths.length > 0 && (
                <div className="bg-green-50 rounded-xl border-2 border-green-200 p-6">
                  <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    Natural Strengths
                  </h4>
                  <ul className="space-y-2">
                    {hexacoAnalysis.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-green-800">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Growth Edges */}
              {hexacoAnalysis.growthEdges && hexacoAnalysis.growthEdges.length > 0 && (
                <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6">
                  <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-blue-600" />
                    Growth Edges
                  </h4>
                  <ul className="space-y-2">
                    {hexacoAnalysis.growthEdges.map((edge: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-blue-800">
                        <span className="text-blue-600 font-bold mt-0.5">→</span>
                        <span className="text-sm">{edge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Relationship, Work, Spiritual Tendencies */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Relationships */}
              <div className="bg-white rounded-lg border border-gray-300 p-5">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  Relationships
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {hexacoAnalysis.relationshipTendencies}
                </p>
              </div>

              {/* Work Style */}
              <div className="bg-white rounded-lg border border-gray-300 p-5">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  Work Style
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {hexacoAnalysis.workStyle}
                </p>
              </div>

              {/* Spiritual Tendencies */}
              <div className="bg-white rounded-lg border border-gray-300 p-5">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-gray-600" />
                  Spiritual Tendencies
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {hexacoAnalysis.spiritualTendencies}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: DNA Alignment Analysis */}
        {dnaAnalysis && !isAnalyzingDna && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 mt-12">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
              <h2 className="text-xl font-bold text-purple-900 tracking-tight">
                How Your DNA Aligns with Your Calling
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
            </div>

            {/* Alignment Score */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white text-center">
              <p className="text-sm text-purple-200 mb-2 uppercase tracking-wide font-semibold">
                Alignment Score
              </p>
              <div className="flex items-baseline justify-center gap-2 mb-3">
                <span className="text-6xl font-bold">{dnaAnalysis.overallAlignment}</span>
                <span className="text-2xl text-purple-200">%</span>
              </div>
              <p className="text-purple-100 text-sm max-w-md mx-auto">
                Your natural temperament aligns with your gifts and calling
              </p>
            </div>

            {/* Spiritual Insight */}
            <div className="bg-white rounded-xl border-2 border-purple-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Your Spiritual DNA Analysis
                </h3>
              </div>
              <div className="prose prose-purple max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {dnaAnalysis.spiritualInsight}
                </p>
              </div>
            </div>

            {/* Natural Fits & Growth Opportunities */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Natural Fits */}
              {dnaAnalysis.naturalFit && dnaAnalysis.naturalFit.length > 0 && (
                <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-6">
                  <h4 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Natural Strengths
                  </h4>
                  <ul className="space-y-2">
                    {dnaAnalysis.naturalFit.map((fit: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-emerald-800">
                        <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                        <span className="text-sm">{fit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Growth Opportunities */}
              {dnaAnalysis.growthOpportunities && dnaAnalysis.growthOpportunities.length > 0 && (
                <div className="bg-amber-50 rounded-xl border-2 border-amber-200 p-6">
                  <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    Growth Edges
                  </h4>
                  <ul className="space-y-2">
                    {dnaAnalysis.growthOpportunities.map((opp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-amber-800">
                        <span className="text-amber-600 font-bold mt-0.5">→</span>
                        <span className="text-sm">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </OnboardingStep>
  );
}
