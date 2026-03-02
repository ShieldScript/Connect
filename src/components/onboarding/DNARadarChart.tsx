'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles } from 'lucide-react';

interface HexacoScores {
  H: number; // Honesty-Humility
  E: number; // Emotionality
  X: number; // Extraversion
  A: number; // Agreeableness
  C: number; // Conscientiousness
  O: number; // Openness
}

interface DNARadarChartProps {
  scores: HexacoScores;
  archetype: string;
  className?: string;
}

export default function DNARadarChart({ scores, archetype, className = '' }: DNARadarChartProps) {
  // Transform HEXACO scores into chart data
  const chartData = [
    {
      dimension: 'Honesty-Humility',
      short: 'H',
      score: scores.H,
      fullMark: 5,
      description: 'Integrity & Sincerity',
    },
    {
      dimension: 'Emotionality',
      short: 'E',
      score: scores.E,
      fullMark: 5,
      description: 'Sensitivity & Depth',
    },
    {
      dimension: 'Extraversion',
      short: 'X',
      score: scores.X,
      fullMark: 5,
      description: 'Social Energy',
    },
    {
      dimension: 'Agreeableness',
      short: 'A',
      score: scores.A,
      fullMark: 5,
      description: 'Harmony & Patience',
    },
    {
      dimension: 'Conscientiousness',
      short: 'C',
      score: scores.C,
      fullMark: 5,
      description: 'Diligence & Order',
    },
    {
      dimension: 'Openness',
      short: 'O',
      score: scores.O,
      fullMark: 5,
      description: 'Curiosity & Creativity',
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-900">{data.dimension}</p>
          <p className="text-sm text-gray-600">{data.description}</p>
          <p className="text-lg font-bold text-purple-600 mt-1">
            {data.score.toFixed(1)} / 5.0
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">Your DNA Profile</h3>
        </div>
        <p className="text-purple-800 font-semibold text-lg">{archetype}</p>
        <p className="text-sm text-gray-600 mt-1">
          How God uniquely designed your natural temperament
        </p>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={chartData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
            />
            <Radar
              name="Your Profile"
              dataKey="score"
              stroke="#9333ea"
              fill="#9333ea"
              fillOpacity={0.6}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {chartData.map((dim) => (
          <div
            key={dim.short}
            className="bg-white rounded-lg p-3 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-600">
                {dim.short}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {dim.score.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-tight">
              {dim.description}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Based on your 60-question HEXACO assessment
        </p>
      </div>
    </div>
  );
}
