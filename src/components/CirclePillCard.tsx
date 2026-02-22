'use client';

import { MapPin, Users, Globe, Settings, Shield } from 'lucide-react';

interface CirclePillCardProps {
  id: string;
  circle: {
    id: string;
    name: string;
    type: string;
    category?: string;
    description?: string | null;
    currentSize: number;
    maxSize?: number | null;
    tags: string[];
    distanceKm?: number;
    isVirtual: boolean;
    status: string;
    creatorName?: string;
    createdBy?: string;
  };
  isHovered: boolean;
  isSelected: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  onManage?: () => void;
  currentUserId?: string;
}

// Type icons mapping
const TYPE_ICONS: Record<string, string> = {
  HOBBY: '🥾',
  SUPPORT: '🤝',
  SPIRITUAL: '🙏',
  PROFESSIONAL: '💼',
  SOCIAL: '🎲',
  OTHER: '🔥',
};

// Status badge configuration
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Open', className: 'bg-green-100 text-green-700 border-green-200' },
  PAUSED: { label: 'Paused', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  ARCHIVED: { label: 'Archived', className: 'bg-gray-100 text-gray-500 border-gray-200' },
};

export function CirclePillCard({
  id,
  circle,
  isHovered,
  isSelected,
  onHover,
  onClick,
  onManage,
  currentUserId,
}: CirclePillCardProps) {
  const isOwnCircle = currentUserId && circle.createdBy === currentUserId;
  const isHuddle = circle.category === 'HUDDLE';
  const typeIcon = TYPE_ICONS[circle.type] || TYPE_ICONS.OTHER;
  const statusConfig = STATUS_CONFIG[circle.status] || STATUS_CONFIG.ACTIVE;

  // Calculate if full
  const isFull = circle.maxSize ? circle.currentSize >= circle.maxSize : false;
  const attendanceText = circle.maxSize
    ? `${circle.currentSize}/${circle.maxSize}`
    : `${circle.currentSize}`;

  return (
    <div
      id={id}
      className={`rounded-lg border-2 transition-all cursor-pointer ${
        isHuddle
          ? isSelected
            ? 'bg-green-50 ring-2 ring-green-500 border-green-400'
            : isHovered
            ? 'bg-green-50 border-green-300'
            : 'bg-green-50/50 border-green-200'
          : isSelected
          ? 'bg-slate-50 ring-2 ring-slate-500 border-slate-300'
          : isHovered
          ? 'bg-slate-50 border-slate-300'
          : 'bg-white border-gray-200'
      }`}
      style={{ outline: 'none' }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      {/* Static Directory View */}
      <div className="flex items-center gap-3 p-3">
        {/* Host Avatar + Time (Option C) */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          {/* Host Mini-Avatar */}
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-slate-600">
              {circle.creatorName
                ? circle.creatorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : '?'}
            </span>
          </div>
          {/* Time Stamp - TODO: Add actual time from circle data */}
          <span className="text-[9px] font-medium text-gray-500">
            Tonight
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {isHuddle && (
              <span className="px-2 py-0.5 bg-green-600 text-white text-[9px] font-bold rounded-full flex items-center gap-1 flex-shrink-0">
                <Shield className="w-2.5 h-2.5" />
                HUDDLE
              </span>
            )}
            <h3 className="font-bold text-gray-900 text-sm truncate">
              {circle.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" strokeWidth={2} />
              <span>{attendanceText}</span>
            </div>
            <span>•</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${statusConfig.className}`}
            >
              {isFull ? 'Full' : statusConfig.label}
            </span>
          </div>
        </div>

        {/* Distance/Badge - Right-aligned */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isOwnCircle && onManage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManage();
              }}
              className="p-1.5 hover:bg-amber-100 rounded transition"
              style={{ outline: 'none' }}
              title="Manage Circle"
            >
              <Settings className="w-4 h-4 text-amber-600" strokeWidth={2} />
            </button>
          )}
          {circle.isVirtual ? (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase border border-emerald-300">
              <Globe className="w-3 h-3" strokeWidth={2} />
              Online
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" strokeWidth={2} />
              <span className="font-medium">{circle.distanceKm?.toFixed(1)}km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
