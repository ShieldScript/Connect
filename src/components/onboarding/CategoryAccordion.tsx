'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChipSelector } from './ChipSelector';
import { ProficiencySlider } from './ProficiencySlider';
import { PrivacyToggle } from './PrivacyToggle';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  activities: Activity[];
}

interface ActivitySelection {
  activityId: string;
  proficiency: number; // 1-5
  privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
}

interface CategoryAccordionProps {
  categories: Category[];
  selections: Map<string, ActivitySelection>;
  onSelectionChange: (
    activityId: string,
    selection: ActivitySelection | null
  ) => void;
  maxSelections?: number;
  className?: string;
}

const activityLabels = {
  1: 'Rarely',
  2: 'Occasionally',
  3: 'Moderately',
  4: 'Frequently',
  5: 'Core',
};

export function CategoryAccordion({
  categories,
  selections,
  onSelectionChange,
  maxSelections,
  className = '',
}: CategoryAccordionProps) {
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(
    null
  );

  const totalSelections = selections.size;

  const handleActivityToggle = (activityId: string) => {
    const isSelected = selections.has(activityId);

    if (isSelected) {
      // Deselect
      setExpandedActivityId(null);
      onSelectionChange(activityId, null);
    } else {
      // Select with defaults
      if (maxSelections && totalSelections >= maxSelections) {
        return; // Cannot select more
      }
      setExpandedActivityId(activityId);
      onSelectionChange(activityId, {
        activityId,
        proficiency: 3, // Default to "Moderately"
        privacy: 'GROUP', // Default privacy
      });
    }
  };

  const handleProficiencyChange = (activityId: string, proficiency: number) => {
    const existing = selections.get(activityId);
    if (existing) {
      onSelectionChange(activityId, { ...existing, proficiency });
    }
  };

  const handlePrivacyChange = (
    activityId: string,
    privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE'
  ) => {
    const existing = selections.get(activityId);
    if (existing) {
      onSelectionChange(activityId, { ...existing, privacy });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selection Count */}
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
        <span className="text-sm font-medium text-blue-900">
          Selected Activities
        </span>
        <Badge variant="default" className="bg-blue-600">
          {totalSelections}
          {maxSelections && ` / ${maxSelections}`}
        </Badge>
      </div>

      {/* Categories */}
      <Accordion type="single" collapsible className="space-y-2">
        {categories.map((category) => {
          const categorySelectionCount = Array.from(selections.values()).filter(
            (sel) =>
              category.activities.some((act) => act.id === sel.activityId)
          ).length;

          return (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border rounded-lg bg-white"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {category.description}
                    </p>
                  </div>
                  {categorySelectionCount > 0 && (
                    <Badge className="bg-green-100 text-green-800">
                      {categorySelectionCount}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 pt-2">
                  {/* Activity Chips */}
                  <div className="flex flex-wrap gap-2">
                    {category.activities.map((activity) => {
                      const isSelected = selections.has(activity.id);
                      const isExpanded = expandedActivityId === activity.id;

                      return (
                        <div key={activity.id} className="w-full">
                          <button
                            type="button"
                            onClick={() => handleActivityToggle(activity.id)}
                            className={`
                              inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                              transition-all duration-200 border-2
                              ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                              }
                              ${
                                maxSelections &&
                                totalSelections >= maxSelections &&
                                !isSelected
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'cursor-pointer'
                              }
                            `}
                            disabled={
                              maxSelections
                                ? totalSelections >= maxSelections && !isSelected
                                : false
                            }
                          >
                            {activity.name}
                          </button>

                          {/* Expanded Settings */}
                          {isSelected && isExpanded && (
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
                              {/* Proficiency Slider */}
                              <ProficiencySlider
                                value={
                                  selections.get(activity.id)?.proficiency || 3
                                }
                                onChange={(val) =>
                                  handleProficiencyChange(activity.id, val)
                                }
                                labels={activityLabels}
                                title="How often do you engage in this activity?"
                              />

                              {/* Privacy Toggle */}
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Privacy
                                </p>
                                <PrivacyToggle
                                  value={
                                    selections.get(activity.id)?.privacy ||
                                    'GROUP'
                                  }
                                  onChange={(val) =>
                                    handlePrivacyChange(activity.id, val)
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
