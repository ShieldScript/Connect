'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';

interface ProficiencyLabels {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}

interface ProficiencySliderProps {
  value: number; // 1-5
  onChange: (value: number) => void;
  labels: ProficiencyLabels;
  title?: string;
  className?: string;
}

export function ProficiencySlider({
  value,
  onChange,
  labels,
  title,
  className = '',
}: ProficiencySliderProps) {
  const handleValueChange = (values: number[]) => {
    const newValue = values[0];
    if (newValue >= 1 && newValue <= 5) {
      onChange(newValue);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {title && <p className="text-sm font-medium text-gray-700">{title}</p>}

      {/* Slider */}
      <div className="px-2">
        <Slider
          min={1}
          max={5}
          step={1}
          value={[value]}
          onValueChange={handleValueChange}
          className="w-full"
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-600 px-1">
        <div className="flex-1 text-left">
          <span className={value === 1 ? 'font-bold text-blue-600' : ''}>
            {labels[1]}
          </span>
        </div>
        <div className="flex-1 text-center">
          <span className={value === 2 ? 'font-bold text-blue-600' : ''}>
            {labels[2]}
          </span>
        </div>
        <div className="flex-1 text-center">
          <span className={value === 3 ? 'font-bold text-blue-600' : ''}>
            {labels[3]}
          </span>
        </div>
        <div className="flex-1 text-center">
          <span className={value === 4 ? 'font-bold text-blue-600' : ''}>
            {labels[4]}
          </span>
        </div>
        <div className="flex-1 text-right">
          <span className={value === 5 ? 'font-bold text-blue-600' : ''}>
            {labels[5]}
          </span>
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm font-semibold text-blue-900">
          {labels[value as keyof ProficiencyLabels]}
        </p>
      </div>
    </div>
  );
}
