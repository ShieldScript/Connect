'use client';

import { useState, useEffect } from 'react';
import DNARadarChart from './DNARadarChart';
import { Sparkles, TrendingUp, Lightbulb, Heart, Loader2 } from 'lucide-react';

interface HexacoScores {
  H: number;
  E: number;
  X: number;
  A: number;
  C: number;
  O: number;
}

interface DNAAnalysis {
  overallAlignment: number;
  naturalFit: string[];
  growthOpportunities: string[];
  spiritualInsight: string;
  dimensionInsights: {
    H: string;
    E: string;
    X: string;
    A: string;
    C: string;
    O: string;
  };
}

interface DNARevealCardProps {
  hexacoScores: HexacoScores;
  archetype: string;
  analysis?: DNAAnalysis | null;
  isLoading?: boolean;
}

export default function DNARevealCard({
  hexacoScores,
  archetype,
  analysis,
  isLoading = false,
}: DNARevealCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Get alignment color
  const getAlignmentColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getAlignmentLabel = (score: number) => {
    if (score >= 80) return 'Exceptional Alignment';
    if (score >= 60) return 'Strong Alignment';
    if (score >= 40) return 'Moderate Alignment';
    return 'Growth Alignment';
  };

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <DNARadarChart scores={hexacoScores} archetype={archetype} />


      {/* Analysis Results */}
      {analysis && !isLoading && (
        <>
          {/* Spiritual Insight */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">
                The Mirror Moment
              </h3>
            </div>
            <div className="prose prose-sm max-w-none">
              {analysis.spiritualInsight.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Natural Fit */}
          {analysis.naturalFit.length > 0 && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-green-900">
                  Natural Fit - Where DNA Supports Your Calling
                </h3>
              </div>
              <ul className="space-y-2">
                {analysis.naturalFit.map((fit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-green-900">{fit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Growth Opportunities */}
          {analysis.growthOpportunities.length > 0 && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-900">
                  Growth Edges - Healthy Tensions to Explore
                </h3>
              </div>
              <ul className="space-y-2">
                {analysis.growthOpportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">→</span>
                    <span className="text-blue-900">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dimension Deep Dive (Expandable) */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-bold text-gray-900">
                Deep Dive: How Each Dimension Shows Up
              </h3>
              <span className="text-purple-600">
                {showDetails ? '▼' : '▶'}
              </span>
            </button>

            {showDetails && (
              <div className="mt-4 space-y-3">
                {Object.entries(analysis.dimensionInsights).map(([key, insight]) => {
                  const labels: Record<string, string> = {
                    H: 'Honesty-Humility',
                    E: 'Emotionality',
                    X: 'Extraversion',
                    A: 'Agreeableness',
                    C: 'Conscientiousness',
                    O: 'Openness',
                  };
                  return (
                    <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-purple-600">{labels[key]}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {hexacoScores[key as keyof HexacoScores].toFixed(1)}/5
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 text-center">
            <p className="text-purple-900 font-medium mb-2">
              This is who God designed you to be.
            </p>
            <p className="text-sm text-purple-700">
              As you enter the Brotherhood, this DNA profile will help you find brothers
              who complement your strengths and callings you're uniquely wired to pursue.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
