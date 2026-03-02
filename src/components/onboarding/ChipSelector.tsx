'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface ChipOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ChipSelectorProps {
  options: ChipOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
  minSelections?: number;
  className?: string;
}

export function ChipSelector({
  options,
  selected,
  onChange,
  maxSelections,
  minSelections,
  className = '',
}: ChipSelectorProps) {
  const handleToggle = (optionId: string) => {
    const isSelected = selected.includes(optionId);

    if (isSelected) {
      // Deselect - check minimum
      if (minSelections && selected.length <= minSelections) {
        return; // Cannot deselect below minimum
      }
      onChange(selected.filter((id) => id !== optionId));
    } else {
      // Select - check maximum
      if (maxSelections && selected.length >= maxSelections) {
        return; // Cannot select more than maximum
      }
      onChange([...selected, optionId]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleToggle(option.id)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200 border-2
              ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }
              ${
                maxSelections && selected.length >= maxSelections && !isSelected
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }
            `}
            disabled={
              maxSelections
                ? selected.length >= maxSelections && !isSelected
                : false
            }
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{option.label}</span>
            {isSelected && <Check className="w-4 h-4" />}
          </button>
        );
      })}
    </div>
  );
}
