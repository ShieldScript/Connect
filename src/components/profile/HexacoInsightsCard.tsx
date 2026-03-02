'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';

interface HexacoInsightsCardProps {
  insights: string | null;
  archetype: string | null;
  onRegenerate?: () => Promise<void>;
}

export default function HexacoInsightsCard({
  insights,
  archetype,
  onRegenerate,
}: HexacoInsightsCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!onRegenerate) return;

    setIsRegenerating(true);
    try {
      await onRegenerate();
    } catch (error) {
      console.error('Failed to regenerate insights:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!insights) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            AI Personality Insights
          </h3>
        </div>

        {onRegenerate && (
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Regenerate insights"
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{isRegenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>
        )}
      </div>

      {/* Archetype Badge */}
      {archetype && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
            {archetype}
          </span>
        </div>
      )}

      {/* Insights Content */}
      <div className="prose prose-sm max-w-none">
        {insights.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          <Sparkles className="w-3 h-3 inline mr-1" />
          AI-powered insights based on your HEXACO personality assessment
        </p>
      </div>
    </div>
  );
}
