'use client';

import React, { useState } from 'react';
import { Plus, X, Globe, Users, Lock } from 'lucide-react';

interface LayerOption {
  id: string;
  label: string;
  description?: string;
}

interface LayerSelection {
  optionId: string;
  level: number; // 1-5
  privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
  customValue?: string;
}

interface AccordionLayerStepProps {
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
  proficiencyDescriptions?: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  proficiencyColors?: {
    1: { color: string; border: string; shadow: string; textColor: string; };
    2: { color: string; border: string; shadow: string; textColor: string; };
    3: { color: string; border: string; shadow: string; textColor: string; };
    4: { color: string; border: string; shadow: string; textColor: string; };
    5: { color: string; border: string; shadow: string; textColor: string; };
  };
  instructionText?: string;
  instructionSubtext?: string;
  sensitivityLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  defaultPrivacy?: 'PUBLIC' | 'GROUP' | 'PRIVATE';
  maxSelections?: number;
  allowCustom?: boolean;
  className?: string;
}

const defaultProficiencyLevels = [
  {
    value: 1,
    label: 'Latent',
    description: 'I recognize this potential and am beginning to explore it.',
    color: 'bg-sky-400 text-white',
    border: 'border-sky-400',
    shadow: 'shadow-[0_0_12px_rgba(56,189,248,0.35)]',
    textColor: 'text-sky-700',
  },
  {
    value: 2,
    label: 'Developing',
    description: 'I am actively practicing this gift and seeing consistent growth.',
    color: 'bg-sky-500 text-white',
    border: 'border-sky-500',
    shadow: 'shadow-[0_0_12px_rgba(14,165,233,0.35)]',
    textColor: 'text-sky-800',
  },
  {
    value: 3,
    label: 'Fluent',
    description: 'I use this naturally and effectively in my daily service.',
    color: 'bg-blue-600 text-white',
    border: 'border-blue-600',
    shadow: 'shadow-[0_0_12px_rgba(37,99,235,0.35)]',
    textColor: 'text-blue-800',
  },
  {
    value: 4,
    label: 'Mastery',
    description: 'I have deep experience here and can effectively guide others.',
    color: 'bg-[#E27D2C] text-white',
    border: 'border-[#E27D2C]',
    shadow: 'shadow-[0_0_12px_rgba(226,125,44,0.35)]',
    textColor: 'text-amber-900',
  },
  {
    value: 5,
    label: 'Core Strength',
    description: 'This is fundamental to who I am; I lead out of this gift.',
    color: 'bg-amber-500 text-white',
    border: 'border-amber-500',
    shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    textColor: 'text-yellow-900',
  },
];

export function AccordionLayerStep({
  options,
  selections,
  onSelectionChange,
  sliderLabels,
  proficiencyDescriptions,
  proficiencyColors,
  instructionText,
  instructionSubtext,
  sensitivityLevel = 'LOW',
  defaultPrivacy = 'PUBLIC',
  maxSelections,
  allowCustom = true,
  className = '',
}: AccordionLayerStepProps) {
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Merge custom labels, descriptions, and colors with defaults
  const proficiencyLevels = defaultProficiencyLevels.map((level) => ({
    ...level,
    label: sliderLabels[level.value as 1 | 2 | 3 | 4 | 5] || level.label,
    description: proficiencyDescriptions?.[level.value as 1 | 2 | 3 | 4 | 5] || level.description,
    ...(proficiencyColors?.[level.value as 1 | 2 | 3 | 4 | 5] || {}),
  }));

  const handlePillClick = (optionId: string) => {
    const isSelected = selections.has(optionId);

    if (isSelected) {
      // If already selected, just toggle active state
      setActiveOptionId(activeOptionId === optionId ? null : optionId);
    } else {
      // Select with defaults and make active
      if (maxSelections && selections.size >= maxSelections) {
        return;
      }
      onSelectionChange(optionId, {
        optionId,
        level: 3,
        privacy: defaultPrivacy,
        customValue: optionId === 'CUSTOM' ? '' : undefined,
      });
      setActiveOptionId(optionId);
    }
  };

  const handleAddCustomClick = () => {
    setActiveOptionId(null); // Clear any active card
    setIsAddingCustom(true);
  };

  const handleRemove = (optionId: string) => {
    onSelectionChange(optionId, null);
    if (activeOptionId === optionId) {
      setActiveOptionId(null);
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

  const handleAddCustom = () => {
    if (!customInput.trim()) return;

    const customId = `CUSTOM_${Date.now()}`;
    onSelectionChange(customId, {
      optionId: customId,
      level: 3,
      privacy: defaultPrivacy,
      customValue: customInput.trim(),
    });
    setActiveOptionId(customId);
    setCustomInput('');
    setIsAddingCustom(false);
  };

  const selectedCount = selections.size;
  const activeSelection = activeOptionId ? selections.get(activeOptionId) : null;
  const activeOption = activeOptionId
    ? options.find((opt) => opt.id === activeOptionId) ||
      { id: activeOptionId, label: selections.get(activeOptionId)?.customValue || 'Custom' }
    : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Instruction - Cohesive Single Block */}
      <div className="space-y-0.5">
        <p className="text-base font-semibold text-gray-900 leading-tight">
          {instructionText || `Select up to ${maxSelections || 8}. Click each to define your proficiency level.`}
        </p>
        {instructionSubtext && (
          <p className="text-sm italic text-gray-500 leading-tight">
            {instructionSubtext}
          </p>
        )}
      </div>

      {/* Selection Pills */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selections.has(option.id);
          const selection = selections.get(option.id);
          const isActive = activeOptionId === option.id;
          const isDefined = isSelected && selection !== undefined && selection.level !== undefined;

          return (
            <button
              key={option.id}
              onClick={() => handlePillClick(option.id)}
              disabled={!isSelected && maxSelections && selectedCount >= maxSelections}
              className={`
                px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                flex items-center gap-1.5
                ${
                  isActive
                    ? 'bg-yellow-500 text-white border-[3px] border-yellow-600 shadow-lg animate-pulse'
                    : isDefined
                    ? 'bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700'
                    : isSelected
                    ? 'bg-white text-gray-900 border-2 border-blue-400 hover:border-blue-500'
                    : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-400'
                }
                ${!isSelected && maxSelections && selectedCount >= maxSelections ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {option.label}
              {isDefined && !isActive && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}

        {/* Custom Pills */}
        {Array.from(selections.entries())
          .filter(([id]) => id.startsWith('CUSTOM_'))
          .map(([id, selection]) => {
            const isActive = activeOptionId === id;
            const isDefined = selection.level !== undefined;
            return (
              <button
                key={id}
                onClick={() => setActiveOptionId(isActive ? null : id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                  flex items-center gap-1.5
                  ${
                    isActive
                      ? 'bg-yellow-500 text-white border-[3px] border-yellow-600 shadow-lg animate-pulse'
                      : isDefined
                      ? 'bg-amber-600 text-white border-2 border-amber-700 hover:bg-amber-700'
                      : 'bg-white text-gray-900 border-2 border-amber-400 hover:border-amber-500'
                  }
                `}
              >
                {selection.customValue || 'Custom'}
                {!isActive && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(id);
                    }}
                    className="ml-1 hover:bg-amber-500 rounded-full p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}

        {/* Add Custom Button */}
        {allowCustom && (!maxSelections || selectedCount < maxSelections) && (
          <button
            onClick={handleAddCustomClick}
            className="px-4 py-2 rounded-full text-sm font-semibold border-2 border-dashed border-gray-400 text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        )}
      </div>

      {/* Custom Input Modal */}
      {isAddingCustom && (
        <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Name this gift:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCustom();
                if (e.key === 'Escape') setIsAddingCustom(false);
              }}
              placeholder="e.g., Financial Planning"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleAddCustom}
              disabled={!customInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingCustom(false);
                setCustomInput('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Card - Focus Mode with Pop */}
      {activeOptionId && activeSelection && activeOption && (() => {
        const currentLevel = proficiencyLevels.find((l) => l.value === activeSelection.level);
        const cardBorderColor = activeSelection.privacy === 'PUBLIC'
          ? 'border-blue-600'
          : activeSelection.privacy === 'GROUP'
          ? 'border-emerald-600'
          : 'border-slate-600';

        return (
          <div className={`bg-[#F9F9F9] border-2 ${cardBorderColor} rounded-xl p-6 space-y-6 shadow-xl`}>
            {/* Header - Title-First Lockup */}
            <div className="flex items-center justify-between">
              {/* Left: Title + Privacy Group */}
              <div className="flex items-center gap-6">
                <h3 className="text-[20px] font-semibold text-gray-900">{activeOption.label}</h3>

                {/* Privacy Badges - Master Label Extension */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePrivacyChange(activeOptionId, 'PUBLIC')}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                      transition-all duration-300
                      ${
                        activeSelection.privacy === 'PUBLIC'
                          ? 'bg-white border-[1.5px] border-blue-600 text-blue-900'
                          : 'text-slate-400 hover:text-slate-600'
                      }
                    `}
                    title="Public - Visible to all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </button>
                  <button
                    onClick={() => handlePrivacyChange(activeOptionId, 'GROUP')}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                      transition-all duration-300
                      ${
                        activeSelection.privacy === 'GROUP'
                          ? 'bg-white border-[1.5px] border-emerald-600 text-emerald-900'
                          : 'text-slate-400 hover:text-slate-600'
                      }
                    `}
                    title="Group - Growth within the body"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Group</span>
                  </button>
                  <button
                    onClick={() => handlePrivacyChange(activeOptionId, 'PRIVATE')}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
                      transition-all duration-300
                      ${
                        activeSelection.privacy === 'PRIVATE'
                          ? 'bg-white border-[1.5px] border-slate-600 text-slate-900'
                          : 'text-slate-400 hover:text-slate-600'
                      }
                    `}
                    title="Private - Only you"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              {/* Right: X Button with Buffer Space */}
              <button
                onClick={() => handleRemove(activeOptionId)}
                className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Remove this gift"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proficiency Selector - Growth Scale */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                How would you describe your proficiency?
              </p>
              <div className="flex w-full">
                {proficiencyLevels.map((level, index) => {
                  const isActive = activeSelection.level === level.value;
                  const isFirst = index === 0;
                  const isLast = index === proficiencyLevels.length - 1;

                  return (
                    <button
                      key={level.value}
                      onClick={() => handleLevelChange(activeOptionId, level.value)}
                      className={`
                        flex-1 px-3 py-2.5 text-sm font-semibold
                        transition-all duration-300 -ml-px first:ml-0
                        ${isFirst ? 'rounded-l-full' : ''}
                        ${isLast ? 'rounded-r-full' : ''}
                        ${
                          isActive
                            ? `${level.color} ${level.border} ${level.shadow} border-2 z-10 relative scale-[1.02]`
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }
                      `}
                      title={level.description}
                    >
                      {level.label}
                    </button>
                  );
                })}
              </div>
              {/* Description - Satin Identity Voice */}
              {currentLevel && (
                <p className={`text-[15px] leading-relaxed font-medium mt-3 text-center ${currentLevel.textColor}`}>
                  {currentLevel.description}
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Subtle Prompt When Nothing Active */}
      {!activeOptionId && selectedCount > 0 && (
        <div className="text-center py-8 text-gray-500 text-sm italic">
          Click a selected gift above to define your proficiency level
        </div>
      )}
    </div>
  );
}
