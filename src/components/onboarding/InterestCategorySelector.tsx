'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft, Check, Globe, Users, Lock, X, ChevronDown, Search, Plus,
  Mountain, Wrench, Dumbbell, Flame, Users as UsersIcon,
  Heart, HandHeart, Palette
} from 'lucide-react';

interface Option {
  id: string;
  label: string;
  category?: string;
}

interface Selection {
  optionId: string;
  level: number;
  privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
  customValue?: string;
}

interface InterestCategorySelectorProps {
  options: Option[];
  selections: Map<string, Selection>;
  onSelectionChange: (optionId: string, selection: Selection | null) => void;
  maxSelections?: number;
}

const CATEGORY_INFO = {
  OUTDOOR_ADVENTURE: {
    label: 'Outdoor & Adventure',
    icon: Mountain,
    color: 'emerald',
    description: 'Hiking, camping, water sports, and outdoor pursuits'
  },
  CRAFTSMANSHIP_TRADES_MAKER: {
    label: 'Craftsmanship, Trades & Maker',
    icon: Wrench,
    color: 'orange',
    description: 'Woodworking, metalworking, construction, and hands-on skills'
  },
  PHYSICALITY_COMBAT_SPORTS: {
    label: 'Physicality, Combat & Team Sports',
    icon: Dumbbell,
    color: 'red',
    description: 'Martial arts, team sports, fitness, and athletic pursuits'
  },
  CULINARY_FIRE_FOOD: {
    label: 'Culinary, Fire & Food Systems',
    icon: Flame,
    color: 'amber',
    description: 'Grilling, cooking, baking, and food preparation'
  },
  STRATEGY_MENTORSHIP_LEADERSHIP: {
    label: 'Strategy, Mentorship & Leadership',
    icon: UsersIcon,
    color: 'blue',
    description: 'Teaching, coaching, business, and strategic thinking'
  },
  FAITH_FORMATION_CARE: {
    label: 'Faith, Formation & Relational Care',
    icon: Heart,
    color: 'purple',
    description: 'Bible study, discipleship, ministry, and spiritual growth'
  },
  SERVICE_CIVIC_COMMUNITY: {
    label: 'Service, Civic & Community Action',
    icon: HandHeart,
    color: 'teal',
    description: 'Volunteering, advocacy, and community service'
  },
  CREATIVE_CULTURAL: {
    label: 'Creative & Cultural',
    icon: Palette,
    color: 'pink',
    description: 'Music, photography, art, and creative expression'
  }
} as const;

type CategoryKey = keyof typeof CATEGORY_INFO;

const COLOR_CLASSES: Record<string, {
  iconBg: string;
  iconText: string;
}> = {
  emerald: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
  orange: { iconBg: 'bg-orange-100', iconText: 'text-orange-600' },
  red: { iconBg: 'bg-red-100', iconText: 'text-red-600' },
  amber: { iconBg: 'bg-amber-100', iconText: 'text-amber-600' },
  blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  teal: { iconBg: 'bg-teal-100', iconText: 'text-teal-600' },
  pink: { iconBg: 'bg-pink-100', iconText: 'text-pink-600' },
};

export function InterestCategorySelector({
  options,
  selections,
  onSelectionChange,
  maxSelections = 20,
}: InterestCategorySelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');

  // Group options by category
  const categorizedOptions = options.reduce((acc, option) => {
    const cat = option.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(option);
    return acc;
  }, {} as Record<string, Option[]>);

  // Debug on mount
  useEffect(() => {
    const serviceCount = options.filter(opt => opt.category === 'SERVICE_CIVIC_COMMUNITY').length;
    console.log('[InterestCategorySelector] Total options:', options.length);
    console.log('[InterestCategorySelector] SERVICE_CIVIC_COMMUNITY count:', serviceCount);
    console.log('[InterestCategorySelector] categorizedOptions keys:', Object.keys(categorizedOptions));
  }, [options, categorizedOptions]);

  const activeSelection = selectedActivity ? selections.get(selectedActivity) : null;

  // Filter categories and activities based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return { categories: Object.keys(CATEGORY_INFO), hasResults: true };
    }

    const query = searchQuery.toLowerCase();
    const matchingCategories: string[] = [];
    const matchingActivities: Record<string, Option[]> = {};

    Object.entries(categorizedOptions).forEach(([categoryKey, activities]) => {
      const categoryInfo = CATEGORY_INFO[categoryKey as CategoryKey];
      const categoryMatches = categoryInfo?.label.toLowerCase().includes(query);

      const filteredActivities = activities.filter(activity =>
        activity.label.toLowerCase().includes(query)
      );

      if (categoryMatches || filteredActivities.length > 0) {
        matchingCategories.push(categoryKey);
        matchingActivities[categoryKey] = filteredActivities.length > 0
          ? filteredActivities
          : activities;
      }
    });

    return {
      categories: matchingCategories,
      matchingActivities,
      hasResults: matchingCategories.length > 0,
    };
  }, [searchQuery, categorizedOptions]);

  const handleCategoryClick = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
    setSelectedActivity(null);
    setShowCustomInput(false); // Reset custom input when switching categories
  };

  const handleCustomCardClick = () => {
    if (expandedCategory === 'CUSTOM') {
      setExpandedCategory(null);
    } else {
      setExpandedCategory('CUSTOM');
    }
    setSelectedActivity(null);
  };

  const handleActivityClick = (activityId: string) => {
    setSelectedActivity(activityId);

    // If activity isn't selected yet, create a default selection
    if (!selections.has(activityId)) {
      onSelectionChange(activityId, {
        optionId: activityId,
        level: 3,
        privacy: 'GROUP'
      });
    }
  };

  const handleLevelChange = (level: number) => {
    if (!selectedActivity) return;

    const currentSelection = selections.get(selectedActivity);
    if (currentSelection) {
      onSelectionChange(selectedActivity, {
        ...currentSelection,
        level
      });
    }
  };

  const handlePrivacyChange = (privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE') => {
    if (!selectedActivity) return;

    const currentSelection = selections.get(selectedActivity);
    if (currentSelection) {
      onSelectionChange(selectedActivity, {
        ...currentSelection,
        privacy
      });
    }
  };

  const handleRemove = () => {
    if (!selectedActivity) return;
    onSelectionChange(selectedActivity, null);
    setSelectedActivity(null);
  };

  const handleAddCustom = () => {
    if (!customInputValue.trim()) return;

    const customId = `CUSTOM_${Date.now()}`;
    onSelectionChange(customId, {
      optionId: customId,
      level: 3,
      privacy: 'GROUP',
      customValue: customInputValue.trim(),
    });
    setSelectedActivity(customId);
    setCustomInputValue('');
    setShowCustomInput(false);
  };

  // Render activity detail overlay
  if (selectedActivity) {
    // Handle both regular and custom activities
    const isCustom = selectedActivity.startsWith('CUSTOM_');
    const activity = isCustom
      ? { id: selectedActivity, label: activeSelection?.customValue || 'Custom Interest', category: undefined }
      : options.find(o => o.id === selectedActivity);

    if (!activity) return null;

    const categoryInfo = activity.category ? CATEGORY_INFO[activity.category as CategoryKey] : undefined;
    const level = activeSelection?.level || 3;
    const privacy = activeSelection?.privacy || 'GROUP';

    const sliderLabels = {
      1: 'Rarely',
      2: 'Occasionally',
      3: 'Moderately',
      4: 'Frequently',
      5: 'Core'
    };

    const proficiencyDescriptions = {
      1: 'I rarely engage in this activity but have some interest.',
      2: 'I occasionally do this when the opportunity arises.',
      3: 'I moderately engage in this on a regular basis.',
      4: 'I frequently pursue this activity and have developed skill.',
      5: 'This is a core part of my life and identity.',
    };

    const proficiencyColors = {
      1: {
        color: 'bg-emerald-300 text-white',
        border: 'border-emerald-300',
        shadow: 'shadow-[0_0_12px_rgba(110,231,183,0.35)]',
        textColor: 'text-emerald-600',
      },
      2: {
        color: 'bg-emerald-500 text-white',
        border: 'border-emerald-500',
        shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.35)]',
        textColor: 'text-emerald-700',
      },
      3: {
        color: 'bg-emerald-600 text-white',
        border: 'border-emerald-600',
        shadow: 'shadow-[0_0_12px_rgba(5,150,105,0.35)]',
        textColor: 'text-emerald-800',
      },
      4: {
        color: 'bg-yellow-500 text-white',
        border: 'border-yellow-500',
        shadow: 'shadow-[0_0_12px_rgba(234,179,8,0.35)]',
        textColor: 'text-yellow-900',
      },
      5: {
        color: 'bg-amber-600 text-white',
        border: 'border-amber-600',
        shadow: 'shadow-[0_0_15px_rgba(217,119,6,0.4)]',
        textColor: 'text-amber-950',
      },
    };

    const getLeftBorderColor = () => {
      switch (privacy) {
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
      <div className="space-y-4">
        {/* Proficiency Card */}
        <div className={`p-6 rounded-xl border border-gray-200 border-l-4 ${getLeftBorderColor()} bg-[#F9F8F6] space-y-4 transition-all duration-300`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <h4 className="font-semibold text-gray-900 text-base">
                {activity.label}
              </h4>

              {/* Privacy Badges */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrivacyChange('PUBLIC')}
                  className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold
                    transition-all duration-300
                    ${privacy === 'PUBLIC'
                      ? 'bg-blue-50 border-[1.5px] border-blue-600 text-blue-900'
                      : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                >
                  <Globe className="w-3 h-3" />
                  <span>Public</span>
                </button>
                <button
                  onClick={() => handlePrivacyChange('GROUP')}
                  className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold
                    transition-all duration-300
                    ${privacy === 'GROUP'
                      ? 'bg-emerald-50 border-[1.5px] border-emerald-600 text-emerald-900'
                      : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                >
                  <Users className="w-3 h-3" />
                  <span>Group</span>
                </button>
                <button
                  onClick={() => handlePrivacyChange('PRIVATE')}
                  className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold
                    transition-all duration-300
                    ${privacy === 'PRIVATE'
                      ? 'bg-slate-50 border-[1.5px] border-slate-600 text-slate-900'
                      : 'text-slate-400 hover:text-slate-600'
                    }
                  `}
                >
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={handleRemove}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Proficiency Slider */}
          <div className="flex w-full">
            {[1, 2, 3, 4, 5].map((lvl, index) => {
              const isActive = level === lvl;
              const isFirst = index === 0;
              const isLast = index === 4;
              const colors = proficiencyColors[lvl as 1 | 2 | 3 | 4 | 5];

              return (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`
                    flex-1 px-3 py-2 text-sm font-semibold
                    transition-all duration-500 -ml-px first:ml-0
                    ${isFirst ? 'rounded-l-full' : ''}
                    ${isLast ? 'rounded-r-full' : ''}
                    ${isActive
                      ? `${colors.color} ${colors.shadow} border-2 ${colors.border} z-10 relative scale-[1.02]`
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                  title={proficiencyDescriptions[lvl as 1 | 2 | 3 | 4 | 5]}
                >
                  {sliderLabels[lvl as 1 | 2 | 3 | 4 | 5]}
                </button>
              );
            })}
          </div>

          {/* Description */}
          {level && proficiencyColors[level as 1 | 2 | 3 | 4 | 5] && (
            <p className={`text-xs leading-relaxed font-medium ${proficiencyColors[level as 1 | 2 | 3 | 4 | 5].textColor}`}>
              {proficiencyDescriptions[level as 1 | 2 | 3 | 4 | 5]}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Get custom selections
  const customSelections = Array.from(selections.entries())
    .filter(([id]) => id.startsWith('CUSTOM_'))
    .map(([id, selection]) => ({
      id,
      label: selection.customValue || '',
    }));

  // Determine if we should show custom card
  const showCustomCard = !searchQuery.trim() || !filteredData.hasResults;

  // Main grid view with expandable categories
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {!expandedCategory && !selectedActivity && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities or add your own..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 placeholder:text-gray-400"
          />
        </div>
      )}

      {!expandedCategory && !selectedActivity && !filteredData.hasResults && searchQuery.trim() && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500">
            No matches found. Add a custom interest below.
          </p>
        </div>
      )}

      {/* Grid Layout - 2 columns */}
      <div className="relative">
        {/* Expanded card overlay */}
        {expandedCategory && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {expandedCategory === 'CUSTOM' ? (
              // Custom interests expanded view
              <div className="rounded-xl border-2 border-amber-400 bg-white shadow-2xl relative">
                {/* Close Button */}
                <button
                  onClick={() => setExpandedCategory(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-20"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Category Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <Plus className="w-8 h-8 text-amber-600" />

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        My Interests
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add activities unique to you
                      </p>
                      {customSelections.length > 0 && (
                        <div className="mt-2">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium text-xs">
                            {customSelections.length} added
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Interest Pills */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {/* Existing custom interests */}
                    {customSelections.map((custom) => (
                      <div
                        key={custom.id}
                        className="px-4 py-2 rounded-full border-2 font-medium bg-amber-50 border-amber-400 text-amber-900 flex items-center gap-2"
                      >
                        <button
                          onClick={() => handleActivityClick(custom.id)}
                          className="hover:underline"
                        >
                          {custom.label}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectionChange(custom.id, null);
                          }}
                          className="hover:text-amber-700 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add Custom Button or Input */}
                    {showCustomInput ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customInputValue}
                          onChange={(e) => setCustomInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customInputValue.trim()) {
                              e.preventDefault();
                              handleAddCustom();
                            } else if (e.key === 'Escape') {
                              setShowCustomInput(false);
                              setCustomInputValue('');
                            }
                          }}
                          placeholder="e.g., Birdwatching, Foraging..."
                          className="px-4 py-2 rounded-full text-sm border-2 border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[200px]"
                          autoFocus
                        />
                        <button
                          onClick={handleAddCustom}
                          disabled={!customInputValue.trim()}
                          className="text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomInputValue('');
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCustomInput(true)}
                        className="px-4 py-2 rounded-full text-sm font-medium border-2 border-dashed border-amber-400 text-amber-700 hover:bg-amber-50 transition-all duration-200 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Interest</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Regular category expanded view
              (() => {
                const info = CATEGORY_INFO[expandedCategory as CategoryKey];
                const categoryActivities = filteredData.matchingActivities?.[expandedCategory] || categorizedOptions[expandedCategory] || [];
                const selectedCount = categoryActivities.filter(
                  opt => selections.has(opt.id)
                ).length;
                const Icon = info.icon;

                return (
                  <div className="rounded-xl border-2 border-gray-200 bg-white shadow-2xl relative">
                    {/* Close Button */}
                    <button
                      onClick={() => setExpandedCategory(null)}
                      className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-20"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Category Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start gap-4">
                        <Icon className={`w-8 h-8 ${COLOR_CLASSES[info.color].iconText}`} />

                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {info.label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {info.description}
                          </p>
                          {selectedCount > 0 && (
                            <div className="mt-2">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium text-xs">
                                {selectedCount} selected
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Activity Pills */}
                    <div className="p-6">
                      {categoryActivities.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No activities available in this category.</p>
                          <p className="text-xs mt-1">Try searching or add a custom interest.</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {categoryActivities.map((activity) => {
                            const isSelected = selections.has(activity.id);

                            return (
                              <button
                                key={activity.id}
                                onClick={() => handleActivityClick(activity.id)}
                                className={`
                                  px-4 py-2 rounded-full border-2 font-medium transition-all
                                  ${isSelected
                                    ? `bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700`
                                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                  }
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  {isSelected && <Check className="w-4 h-4" />}
                                  <span>{activity.label}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* Grid of category cards */}
        {!expandedCategory && (
          <div className="grid md:grid-cols-2 gap-4 animate-in fade-in duration-300">
            {filteredData.categories.map((key) => {
              const info = CATEGORY_INFO[key as CategoryKey];
              const categoryActivities = categorizedOptions[key] || [];
              const selectedCount = categoryActivities.filter(
                opt => selections.has(opt.id)
              ).length;
              const Icon = info.icon;

              return (
                <button
                  key={key}
                  onClick={() => handleCategoryClick(key)}
                  className={`
                    rounded-xl border-2 p-6 text-left hover:shadow-md transition-all duration-200
                    ${selectedCount > 0 ? 'border-emerald-400 bg-emerald-50/30' : 'border-gray-200 bg-white'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Icon className={`w-8 h-8 ${COLOR_CLASSES[info.color].iconText} flex-shrink-0`} />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {info.label}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {info.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-500">{categoryActivities.length} activities</span>
                          {selectedCount > 0 && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                              {selectedCount} selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                  </div>
                </button>
              );
            })}

            {/* Custom Interest Card */}
            {showCustomCard && (
              <button
                onClick={handleCustomCardClick}
                className={`
                  rounded-xl border-2 p-6 text-left hover:shadow-md transition-all duration-200
                  ${customSelections.length > 0
                    ? 'border-amber-400 bg-amber-50/30'
                    : 'border-dashed border-amber-400 bg-amber-50/30'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Plus className="w-8 h-8 text-amber-600 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">
                        My Interests
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Add activities unique to you
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500">Custom activities</span>
                        {customSelections.length > 0 && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                            {customSelections.length} added
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      {selections.size > 0 && !expandedCategory && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selections.size} {selections.size === 1 ? 'interest' : 'interests'} selected
              </span>
            </div>
            <span className="text-xs text-blue-600">
              {maxSelections - selections.size} remaining
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
