'use client';

import React, { useState } from 'react';
import { ChipSelector } from './ChipSelector';
import { ProficiencySlider } from './ProficiencySlider';
import { PrivacyToggle } from './PrivacyToggle';

interface LayerOption {
  id: string;
  label: string;
  description?: string;
}

interface LayerSelection {
  optionId: string;
  level: number; // 1-5
  privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
  customValue?: string; // For "CUSTOM" option
}

interface LayerStepProps {
  options: LayerOption[];
  selections: Map<string, LayerSelection>;
  onSelectionChange: (optionId: string, selection: LayerSelection | null) => void;
  sliderLabels: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  sliderQuestion: string;
  sensitivityLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  defaultPrivacy?: 'PUBLIC' | 'GROUP' | 'PRIVATE';
  maxSelections?: number;
  allowCustom?: boolean;
  className?: string;
}

export function LayerStep({
  options,
  selections,
  onSelectionChange,
  sliderLabels,
  sliderQuestion,
  sensitivityLevel = 'LOW',
  defaultPrivacy = 'PUBLIC',
  maxSelections,
  allowCustom = true,
  className = '',
}: LayerStepProps) {
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');

  const handleOptionToggle = (optionId: string) => {
    const isSelected = selections.has(optionId);

    if (isSelected) {
      // Deselect
      setExpandedOptionId(null);
      onSelectionChange(optionId, null);
    } else {
      // Select with defaults
      if (maxSelections && selections.size >= maxSelections) {
        return;
      }
      setExpandedOptionId(optionId);
      onSelectionChange(optionId, {
        optionId,
        level: 3,
        privacy: defaultPrivacy,
        customValue: optionId === 'CUSTOM' ? '' : undefined,
      });
    }
  };

  const handleLevelChange = (optionId: string, level: number) => {
    const existing = selections.get(optionId);
    if (existing) {
      onSelectionChange(optionId, { ...existing, level });
    }
  };

  const handlePrivacyChange = (
    optionId: string,
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE'
  ) => {
    const existing = selections.get(optionId);
    if (existing) {
      onSelectionChange(optionId, { ...existing, privacy });
    }
  };

  const handleCustomValueChange = (optionId: string, customValue: string) => {
    const existing = selections.get(optionId);
    if (existing) {
      onSelectionChange(optionId, { ...existing, customValue });
    }
  };

  const selectedOptionIds = Array.from(selections.keys());

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selection Count */}
      {maxSelections && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">{selections.size}</span> of{' '}
            <span className="font-semibold">{maxSelections}</span> selected
          </p>
        </div>
      )}

      {/* Option Chips */}
      <div className="space-y-4">
        <ChipSelector
          options={options.map((opt) => ({ id: opt.id, label: opt.label }))}
          selected={selectedOptionIds}
          onChange={(selected) => {
            // Handle multi-select changes
            const added = selected.filter((id) => !selectedOptionIds.includes(id));
            const removed = selectedOptionIds.filter((id) => !selected.includes(id));

            added.forEach((id) => handleOptionToggle(id));
            removed.forEach((id) => handleOptionToggle(id));
          }}
          maxSelections={maxSelections}
        />

        {/* Expanded Settings for Selected Options */}
        {selectedOptionIds.map((optionId) => {
          const option = options.find((opt) => opt.id === optionId);
          const selection = selections.get(optionId);
          const isExpanded = expandedOptionId === optionId;

          if (!option || !selection) return null;

          return (
            <div key={optionId}>
              <button
                type="button"
                onClick={() =>
                  setExpandedOptionId(isExpanded ? null : optionId)
                }
                className="w-full text-left p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">
                    {option.label}
                  </span>
                  <span className="text-sm text-blue-600">
                    {isExpanded ? 'Hide details' : 'Edit details'}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
                  {/* Custom Input */}
                  {optionId === 'CUSTOM' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specify custom option
                      </label>
                      <input
                        type="text"
                        value={selection.customValue || ''}
                        onChange={(e) =>
                          handleCustomValueChange(optionId, e.target.value)
                        }
                        placeholder="Enter custom option..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Proficiency Slider */}
                  <ProficiencySlider
                    value={selection.level}
                    onChange={(val) => handleLevelChange(optionId, val)}
                    labels={sliderLabels}
                    title={sliderQuestion}
                  />

                  {/* Privacy Toggle */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Privacy
                    </p>
                    <PrivacyToggle
                      value={selection.privacy}
                      onChange={(val) => handlePrivacyChange(optionId, val)}
                      sensitivityLevel={sensitivityLevel}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
