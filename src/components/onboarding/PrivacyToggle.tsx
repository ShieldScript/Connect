'use client';

import React from 'react';
import { Globe, Users, Lock, AlertTriangle } from 'lucide-react';

type PrivacyLevel = 'PUBLIC' | 'GROUP' | 'PRIVATE';
type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface PrivacyToggleProps {
  value: PrivacyLevel;
  onChange: (value: PrivacyLevel) => void;
  sensitivityLevel?: SensitivityLevel;
  className?: string;
  showLabels?: boolean;
}

const privacyOptions = [
  {
    value: 'PUBLIC' as const,
    label: 'Public',
    description: 'Visible to everyone',
    icon: Globe,
    color: 'blue',
  },
  {
    value: 'GROUP' as const,
    label: 'Group',
    description: 'Only visible in matched groups',
    icon: Users,
    color: 'green',
  },
  {
    value: 'PRIVATE' as const,
    label: 'Private',
    description: 'Only visible to you',
    icon: Lock,
    color: 'gray',
  },
];

export function PrivacyToggle({
  value,
  onChange,
  sensitivityLevel = 'LOW',
  className = '',
  showLabels = true,
}: PrivacyToggleProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Sensitivity Warning */}
      {sensitivityLevel === 'HIGH' && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            This information is sensitive. We recommend keeping it private.
          </p>
        </div>
      )}

      {/* Privacy Options */}
      <div className="flex gap-2">
        {privacyOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border-2
                transition-all duration-200
                ${
                  isSelected
                    ? `border-${option.color}-600 bg-${option.color}-50`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              title={option.description}
            >
              <Icon
                className={`w-5 h-5 ${
                  isSelected
                    ? `text-${option.color}-600`
                    : 'text-gray-400'
                }`}
              />
              {showLabels && (
                <span
                  className={`text-xs font-medium ${
                    isSelected ? `text-${option.color}-900` : 'text-gray-600'
                  }`}
                >
                  {option.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Description */}
      {showLabels && (
        <p className="text-xs text-gray-500 text-center">
          {privacyOptions.find((opt) => opt.value === value)?.description}
        </p>
      )}
    </div>
  );
}
