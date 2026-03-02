'use client';

import React, { useState } from 'react';
import { Check, Globe, Users, Lock, Plus, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  category?: string;
}

interface Selection {
  proficiency: number;
  privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
  customValue?: string;
}

interface ProficiencyColor {
  color: string;
  border: string;
  shadow: string;
  textColor: string;
}

interface CategorySliderConfig {
  sliderLabels: { 1: string; 2: string; 3: string; 4: string; 5: string };
  proficiencyDescriptions: { 1: string; 2: string; 3: string; 4: string; 5: string };
}

interface CategoryGridLayerStepProps {
  options: Option[];
  selections: Map<string, Selection>;
  onSelectionChange: (optionId: string, selection: Selection | null) => void;
  sliderLabels: { 1: string; 2: string; 3: string; 4: string; 5: string };
  proficiencyDescriptions: { 1: string; 2: string; 3: string; 4: string; 5: string };
  proficiencyColors: {
    1: ProficiencyColor;
    2: ProficiencyColor;
    3: ProficiencyColor;
    4: ProficiencyColor;
    5: ProficiencyColor;
  };
  instructionText: string;
  instructionSubtext: string;
  sensitivityLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  defaultPrivacy?: 'PUBLIC' | 'GROUP' | 'PRIVATE';
  maxSelections?: number;
  customSectionLabel?: string;
  customButtonLabel?: string;
  customInputPlaceholder?: string;
  allowedPrivacyLevels?: ('PUBLIC' | 'GROUP' | 'PRIVATE')[];
  categorySliderConfigs?: Record<string, CategorySliderConfig>;
}

const CATEGORY_ORDER = [
  // Interest Categories (8)
  'OUTDOOR_ADVENTURE', 'CRAFTSMANSHIP_TRADES_MAKER', 'PHYSICALITY_COMBAT_SPORTS',
  'CULINARY_FIRE_FOOD', 'STRATEGY_MENTORSHIP_LEADERSHIP', 'FAITH_FORMATION_CARE',
  'SERVICE_CIVIC_COMMUNITY', 'CREATIVE_CULTURAL',
  // Other Layer Categories
  'RELATIONAL', 'STRATEGIC', 'OPERATIONAL', 'SPIRITUAL',
  'RESTORATION', 'INNER_PEACE', 'SURRENDER',
  'FOUNDATIONS', 'LIFE_SEASONS', 'REFINING_FIRES', 'BREAKTHROUGHS',
  'WORD_SHEPHERDING', 'OUTREACH_COMMUNITY', 'PRESENCE_WORSHIP', 'SERVICE_OPERATIONS',
  'REVELATORY', 'POWER_SIGN', 'EQUIPPING_SERVICE', 'EXPRESSIVE',
  'INTERPERSONAL', 'PROBLEM_SOLVING', 'CREATIVE_TALENT', 'FUNCTIONAL',
  'EARLY_HORIZONS', 'FAMILY_SEASONS', 'SHIFTING_GEARS', 'NAVIGATING_CHANGE',
  'PERSONAL_GROWTH', 'EQUIPPING', 'RESTORATIVE',
  'INWARD_PATH', 'RELATIONAL_PATH', 'RECOVERY_PATH',
  'PERSONAL_DEVOTION', 'COMMUNION', 'OUTWARD_EXPRESSION',
  'WEEKLY_WINDOWS', 'CURRENT_LOAD', 'SOCIAL_STYLE'
];

const CATEGORY_LABELS: Record<string, string> = {
  // Interest Categories
  OUTDOOR_ADVENTURE: 'OUTDOOR & ADVENTURE',
  CRAFTSMANSHIP_TRADES_MAKER: 'CRAFTSMANSHIP, TRADES & MAKER',
  PHYSICALITY_COMBAT_SPORTS: 'PHYSICALITY, COMBAT & TEAM SPORTS',
  CULINARY_FIRE_FOOD: 'CULINARY, FIRE & FOOD SYSTEMS',
  STRATEGY_MENTORSHIP_LEADERSHIP: 'STRATEGY, MENTORSHIP & LEADERSHIP',
  FAITH_FORMATION_CARE: 'FAITH, FORMATION & RELATIONAL CARE',
  SERVICE_CIVIC_COMMUNITY: 'SERVICE, CIVIC & COMMUNITY ACTION',
  CREATIVE_CULTURAL: 'CREATIVE & CULTURAL',
  // Other Layer Categories
  RELATIONAL: 'RELATIONAL',
  STRATEGIC: 'STRATEGIC',
  OPERATIONAL: 'OPERATIONAL',
  SPIRITUAL: 'SPIRITUAL',
  RESTORATION: 'RESTORATION',
  INNER_PEACE: 'INNER PEACE',
  SURRENDER: 'SURRENDER',
  FOUNDATIONS: 'FOUNDATIONS',
  LIFE_SEASONS: 'LIFE SEASONS',
  REFINING_FIRES: 'REFINING FIRES',
  BREAKTHROUGHS: 'BREAKTHROUGHS',
  WORD_SHEPHERDING: 'WORD & SHEPHERDING',
  OUTREACH_COMMUNITY: 'OUTREACH & COMMUNITY',
  PRESENCE_WORSHIP: 'PRESENCE & WORSHIP',
  SERVICE_OPERATIONS: 'SERVICE & OPERATIONS',
  REVELATORY: 'REVELATORY',
  POWER_SIGN: 'POWER & SIGN',
  EQUIPPING_SERVICE: 'EQUIPPING & SERVICE',
  EXPRESSIVE: 'EXPRESSIVE',
  INTERPERSONAL: 'INTERPERSONAL',
  PROBLEM_SOLVING: 'PROBLEM SOLVING',
  CREATIVE_TALENT: 'CREATIVE & TALENT',
  FUNCTIONAL: 'FUNCTIONAL',
  EARLY_HORIZONS: 'EARLY HORIZONS',
  FAMILY_SEASONS: 'FAMILY SEASONS',
  SHIFTING_GEARS: 'SHIFTING GEARS',
  NAVIGATING_CHANGE: 'NAVIGATING CHANGE',
  PERSONAL_GROWTH: 'PERSONAL GROWTH',
  EQUIPPING: 'EQUIPPING',
  RESTORATIVE: 'RESTORATIVE',
  INWARD_PATH: 'THE INWARD PATH',
  RELATIONAL_PATH: 'THE RELATIONAL PATH',
  RECOVERY_PATH: 'THE RECOVERY PATH',
  PERSONAL_DEVOTION: 'PERSONAL DEVOTION',
  COMMUNION: 'COMMUNION',
  OUTWARD_EXPRESSION: 'OUTWARD EXPRESSION',
  WEEKLY_WINDOWS: 'WEEKLY WINDOWS',
  CURRENT_LOAD: 'CURRENT LOAD',
  SOCIAL_STYLE: 'SOCIAL STYLE',
};

const CATEGORY_COLORS: Record<string, string> = {
  // Milestone categories
  FOUNDATIONS: 'bg-blue-600',
  LIFE_SEASONS: 'bg-emerald-600',
  REFINING_FIRES: 'bg-red-600',
  BREAKTHROUGHS: 'bg-purple-600',
  // Leadership categories
  RELATIONAL: 'bg-pink-600',
  STRATEGIC: 'bg-blue-600',
  OPERATIONAL: 'bg-slate-600',
  SPIRITUAL: 'bg-purple-600',
  // Growth categories
  RESTORATION: 'bg-emerald-600',
  INNER_PEACE: 'bg-blue-600',
  SURRENDER: 'bg-purple-600',
  // Ministry categories
  WORD_SHEPHERDING: 'bg-blue-600',
  OUTREACH_COMMUNITY: 'bg-orange-600',
  PRESENCE_WORSHIP: 'bg-purple-600',
  SERVICE_OPERATIONS: 'bg-slate-600',
  // Supernatural gift categories
  REVELATORY: 'bg-purple-600',
  POWER_SIGN: 'bg-red-600',
  EQUIPPING_SERVICE: 'bg-blue-600',
  EXPRESSIVE: 'bg-pink-600',
  // Natural gift categories
  INTERPERSONAL: 'bg-pink-600',
  PROBLEM_SOLVING: 'bg-blue-600',
  CREATIVE_TALENT: 'bg-purple-600',
  FUNCTIONAL: 'bg-slate-600',
  // Life stage categories
  EARLY_HORIZONS: 'bg-blue-600',
  FAMILY_SEASONS: 'bg-emerald-600',
  SHIFTING_GEARS: 'bg-orange-600',
  NAVIGATING_CHANGE: 'bg-red-600',
  // Calling categories
  PERSONAL_GROWTH: 'bg-blue-600',
  EQUIPPING: 'bg-purple-600',
  RESTORATIVE: 'bg-emerald-600',
  // Healing categories
  INWARD_PATH: 'bg-blue-600',
  RELATIONAL_PATH: 'bg-pink-600',
  RECOVERY_PATH: 'bg-purple-600',
  // Practice categories
  PERSONAL_DEVOTION: 'bg-blue-600',
  COMMUNION: 'bg-purple-600',
  OUTWARD_EXPRESSION: 'bg-emerald-600',
  // Boundary categories
  WEEKLY_WINDOWS: 'bg-blue-600',
  CURRENT_LOAD: 'bg-orange-600',
  SOCIAL_STYLE: 'bg-pink-600',
  // Interest categories
  OUTDOOR_ADVENTURE: 'bg-emerald-600',
  CRAFTSMANSHIP_TRADES_MAKER: 'bg-orange-600',
  PHYSICALITY_COMBAT_SPORTS: 'bg-red-600',
  CULINARY_FIRE_FOOD: 'bg-orange-600',
  STRATEGY_MENTORSHIP_LEADERSHIP: 'bg-blue-600',
  FAITH_FORMATION_CARE: 'bg-purple-600',
  SERVICE_CIVIC_COMMUNITY: 'bg-emerald-600',
  CREATIVE_CULTURAL: 'bg-pink-600',
};

export function CategoryGridLayerStep({
  options,
  selections,
  onSelectionChange,
  sliderLabels,
  proficiencyDescriptions,
  proficiencyColors,
  instructionText,
  instructionSubtext,
  defaultPrivacy = 'GROUP',
  maxSelections,
  customSectionLabel = 'MY UNIQUE PATTERNS',
  customButtonLabel = 'Add Custom Pattern',
  customInputPlaceholder = 'Type your pattern...',
  allowedPrivacyLevels = ['PUBLIC', 'GROUP', 'PRIVATE'],
  categorySliderConfigs,
}: CategoryGridLayerStepProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [customInputVisible, setCustomInputVisible] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');

  // Group options by category
  const categorizedOptions: Record<string, Option[]> = {};

  options.forEach((opt) => {
    if (!opt.id.startsWith('CUSTOM_') && opt.category && CATEGORY_ORDER.includes(opt.category)) {
      if (!categorizedOptions[opt.category]) {
        categorizedOptions[opt.category] = [];
      }
      categorizedOptions[opt.category].push(opt);
    }
  });

  // Build custom options from selections (source of truth)
  const customSelections = Array.from(selections.entries())
    .filter(([id]) => id.startsWith('CUSTOM_'))
    .map(([id, selection]) => ({
      id,
      label: selection.customValue || '',
    }));

  const handlePillClick = (optionId: string) => {
    const isSelected = selections.has(optionId);

    if (isSelected) {
      // If already selected, expand the card
      setActiveCardId(optionId);
    } else {
      // Select with defaults
      if (maxSelections && selections.size >= maxSelections) {
        return;
      }
      onSelectionChange(optionId, {
        proficiency: 3,
        privacy: defaultPrivacy,
      });
      setActiveCardId(optionId);
    }
  };

  const handleProficiencyChange = (optionId: string, proficiency: number) => {
    const existing = selections.get(optionId);
    if (existing) {
      onSelectionChange(optionId, { ...existing, proficiency });
    }
  };

  const handlePrivacyChange = (optionId: string, privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE') => {
    const existing = selections.get(optionId);
    if (existing) {
      onSelectionChange(optionId, { ...existing, privacy });
    }
  };

  const handleRemoveSelection = (optionId: string) => {
    onSelectionChange(optionId, null);
    if (activeCardId === optionId) {
      setActiveCardId(null);
    }
  };

  const handleAddCustom = () => {
    if (!customInputValue.trim()) return;

    const customId = `CUSTOM_${Date.now()}`;
    onSelectionChange(customId, {
      proficiency: 3,
      privacy: defaultPrivacy,
      customValue: customInputValue.trim(),
    });
    setActiveCardId(customId);
    setCustomInputValue('');
    setCustomInputVisible(false);
  };

  const getPillStyle = (optionId: string, isCustom: boolean = false) => {
    const isSelected = selections.has(optionId);

    if (isCustom && isSelected) {
      // Custom pills use consistent orange theme (like system pills use consistent blue)
      return 'bg-amber-50 text-amber-900 border-2 border-amber-400';
    }

    if (isCustom && !isSelected) {
      // Unselected custom pills have lighter orange theme
      return 'bg-amber-50 text-amber-900 border-2 border-amber-300 hover:border-amber-400';
    }

    if (isSelected) {
      // System pills use indigo/blue theme
      return 'bg-indigo-50 text-indigo-900 border-2 border-indigo-400';
    }

    return 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300';
  };

  // Helper to determine which category an option belongs to
  const getOptionCategory = (optionId: string): string | null => {
    if (optionId.startsWith('CUSTOM_')) {
      return 'CUSTOM';
    }
    const option = options.find((opt) => opt.id === optionId);
    return option?.category || null;
  };

  const activeSelection = activeCardId ? selections.get(activeCardId) : null;
  const activeCategoryKey = activeCardId ? getOptionCategory(activeCardId) : null;

  // Render the active proficiency card
  const renderActiveCard = () => {
    if (!activeCardId || !activeSelection) return null;

    // Get category-specific slider config if available
    const activeOption = options.find(opt => opt.id === activeCardId);
    const activeCategory = activeOption?.category;
    const categoryConfig = activeCategory && categorySliderConfigs?.[activeCategory];

    // Use category-specific config or fall back to default
    const currentSliderLabels = categoryConfig?.sliderLabels || sliderLabels;
    const currentProficiencyDescriptions = categoryConfig?.proficiencyDescriptions || proficiencyDescriptions;

    // Dynamic left border color based on privacy level (covenant-style)
    const getLeftBorderColor = () => {
      switch (activeSelection.privacy) {
        case 'PUBLIC':
          return 'border-l-blue-600';
        case 'GROUP':
          return 'border-l-emerald-600';
        case 'PRIVATE':
          return 'border-l-slate-600';
        default:
          return 'border-l-gray-300';
      }
    };

    return (
      <div className={`mt-3 p-6 rounded-xl border border-gray-200 border-l-4 ${getLeftBorderColor()} bg-[#F9F8F6] space-y-4 transition-all duration-300 relative`}>
        {/* Header with Privacy and Remove */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <h4 className="font-semibold text-gray-900 text-base">
              {activeCardId.startsWith('CUSTOM_')
                ? activeSelection.customValue
                : options.find((o) => o.id === activeCardId)?.label || 'Pattern'}
            </h4>

            {/* Privacy Badges */}
            <div className="flex gap-2">
              {allowedPrivacyLevels.includes('PUBLIC') && (
                <button
                  onClick={() => handlePrivacyChange(activeCardId, 'PUBLIC')}
                  className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold
                    transition-all duration-300
                    ${
                      activeSelection.privacy === 'PUBLIC'
                        ? 'bg-blue-50 border-[1.5px] border-blue-600 text-blue-900'
                        : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                  title="Public - Visible to all"
                >
                  <Globe className="w-3 h-3" />
                  <span>Public</span>
                </button>
              )}
              {allowedPrivacyLevels.includes('GROUP') && (
                <button
                  onClick={() => handlePrivacyChange(activeCardId, 'GROUP')}
                  className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold
                    transition-all duration-300
                    ${
                      activeSelection.privacy === 'GROUP'
                        ? 'bg-emerald-50 border-[1.5px] border-emerald-600 text-emerald-900'
                        : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                  title="Group - Growth within the body"
                >
                  <Users className="w-3 h-3" />
                  <span>Group</span>
                </button>
              )}
              {allowedPrivacyLevels.includes('PRIVATE') && (
                <button
                  onClick={() => handlePrivacyChange(activeCardId, 'PRIVATE')}
                  className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold
                    transition-all duration-300
                    ${
                      activeSelection.privacy === 'PRIVATE'
                        ? 'bg-slate-50 border-[1.5px] border-slate-600 text-slate-900'
                        : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                  title="Private - Only you"
                >
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <button
              onClick={() => setActiveCardId(null)}
              className="text-emerald-500 hover:text-emerald-600 transition-colors"
              aria-label="Confirm"
              title="Confirm and close"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleRemoveSelection(activeCardId)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Remove"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Proficiency Slider */}
        <div className="flex w-full">
          {[1, 2, 3, 4, 5].map((level, index) => {
            const isActive = activeSelection.proficiency === level;
            const isFirst = index === 0;
            const isLast = index === 4;
            const colors = proficiencyColors[level as 1 | 2 | 3 | 4 | 5];

            return (
              <button
                key={level}
                onClick={() => handleProficiencyChange(activeCardId, level)}
                className={`
                  flex-1 px-3 py-2 text-sm font-semibold
                  transition-all duration-500 -ml-px first:ml-0
                  ${isFirst ? 'rounded-l-full' : ''}
                  ${isLast ? 'rounded-r-full' : ''}
                  ${
                    isActive
                      ? `${colors.color} ${colors.shadow} border-2 ${colors.border} z-10 relative scale-[1.02]`
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }
                `}
                title={currentProficiencyDescriptions[level as 1 | 2 | 3 | 4 | 5]}
              >
                {currentSliderLabels[level as 1 | 2 | 3 | 4 | 5]}
              </button>
            );
          })}
        </div>

        {/* Description */}
        {activeSelection.proficiency && proficiencyColors[activeSelection.proficiency as 1 | 2 | 3 | 4 | 5] && (
          <p className={`text-xs leading-relaxed font-medium ${proficiencyColors[activeSelection.proficiency as 1 | 2 | 3 | 4 | 5].textColor}`}>
            {currentProficiencyDescriptions[activeSelection.proficiency as 1 | 2 | 3 | 4 | 5]}
          </p>
        )}

      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Instruction Text - Only show if provided */}
      {(instructionText || instructionSubtext) && (
        <div className="space-y-0.5 leading-tight">
          {instructionText && <p className="text-sm font-semibold text-gray-900">{instructionText}</p>}
          {instructionSubtext && <p className="text-sm italic text-gray-500 max-w-lg">{instructionSubtext}</p>}
        </div>
      )}

      {/* Categorized Pills Grid */}
      <div className="space-y-3">
        {CATEGORY_ORDER.map((categoryKey, index) => {
          const categoryOptions = categorizedOptions[categoryKey];
          if (!categoryOptions || categoryOptions.length === 0) return null;

          return (
            <div key={categoryKey}>
              <div
                className="flex gap-4 items-start bg-slate-50/40 -mx-4 px-4 py-3 rounded-xl border border-slate-100/50"
              >
                {/* Category Header with Visual Anchor - Fixed Width Column */}
                <div className="flex items-center gap-2 w-[140px] flex-shrink-0">
                  <div className={`w-0.5 h-4 ${CATEGORY_COLORS[categoryKey] || 'bg-blue-600'} rounded-full`}></div>
                  <h3 className="text-xs font-extrabold text-gray-500 tracking-wide uppercase leading-tight">
                    {CATEGORY_LABELS[categoryKey]}
                  </h3>
                </div>

                {/* Pills Grid - Flex Wrap in Remaining Space */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {categoryOptions.map((opt) => {
                    const isSelected = selections.has(opt.id);
                    const isDisabled = maxSelections && selections.size >= maxSelections && !isSelected;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => !isDisabled && handlePillClick(opt.id)}
                        disabled={isDisabled}
                        className={`
                          px-4 py-2 rounded-full text-sm font-medium
                          transition-all duration-200
                          flex items-center gap-2
                          ${getPillStyle(opt.id)}
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Card - Render below pills if this is the active category */}
              {activeCategoryKey === categoryKey && (
                <div className="-mx-4 px-4">
                  {renderActiveCard()}
                </div>
              )}
            </div>
          );
        })}

        {/* Custom Section (MY UNIQUE PATTERNS / MY JOURNEY / etc.) - Workspace */}
        <div>
          <div className="flex gap-4 items-start bg-amber-50/30 -mx-4 px-4 py-3 rounded-xl border border-amber-200/40">
            <div className="flex items-center gap-2 w-[140px] flex-shrink-0">
              <div className="w-0.5 h-4 bg-amber-600 rounded-full"></div>
              <h3 className="text-xs font-extrabold text-amber-700 tracking-wide uppercase leading-tight">
                {customSectionLabel}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 flex-1">
              {/* Custom Pills - Show results FIRST */}
              {customSelections.map((custom) => {
                return (
                  <div
                    key={custom.id}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium
                      transition-all duration-200
                      flex items-center gap-2
                      ${getPillStyle(custom.id, true)}
                    `}
                  >
                    <button
                      onClick={() => handlePillClick(custom.id)}
                      className="hover:underline"
                    >
                      {custom.label}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSelection(custom.id);
                      }}
                      className="hover:text-amber-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>
                  </div>
                );
              })}

              {/* Add Custom Button or Input - AT THE END */}
              {customInputVisible ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customInputValue}
                    onChange={(e) => setCustomInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustom();
                      } else if (e.key === 'Escape') {
                        setCustomInputVisible(false);
                        setCustomInputValue('');
                      }
                    }}
                    onBlur={() => {
                      // Only hide if input is empty
                      if (!customInputValue.trim()) {
                        setCustomInputVisible(false);
                      }
                    }}
                    placeholder={customInputPlaceholder}
                    className="px-4 py-2 rounded-full text-sm border-2 border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[180px]"
                    autoFocus
                  />
                  <button
                    onClick={handleAddCustom}
                    className="text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setCustomInputVisible(false);
                      setCustomInputValue('');
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCustomInputVisible(true)}
                  className="px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed border-amber-400 text-amber-700 hover:bg-amber-50 transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{customButtonLabel}</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Card - Render below pills if a custom pill is active */}
          {activeCategoryKey === 'CUSTOM' && (
            <div className="-mx-4 px-4">
              {renderActiveCard()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
