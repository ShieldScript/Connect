'use client';

import { ArrowRight, MapPin, Users } from 'lucide-react';

interface CircleCardProps {
  circle: {
    id: string;
    name: string;
    type: string;
    currentSize: number;
    maxSize?: number | null;
    tags: string[];
    distanceKm: number;
    isVirtual: boolean;
    status: string;
    creatorName?: string;
  };
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
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
  ACTIVE: { label: 'Open', className: 'bg-green-100 text-green-800' },
  PAUSED: { label: 'Paused', className: 'bg-gray-100 text-gray-600' },
  ARCHIVED: { label: 'Archived', className: 'bg-gray-100 text-gray-400' },
};

export function CircleCard({
  circle,
  isHovered,
  onHover,
  onClick,
}: CircleCardProps) {
  const typeIcon = TYPE_ICONS[circle.type] || TYPE_ICONS.OTHER;
  const statusConfig = STATUS_CONFIG[circle.status] || STATUS_CONFIG.ACTIVE;

  // Calculate if full
  const isFull = circle.maxSize ? circle.currentSize >= circle.maxSize : false;
  const attendanceText = circle.maxSize
    ? `${circle.currentSize}/${circle.maxSize}`
    : `${circle.currentSize}`;

  return (
    <div
      className={`bg-white border-2 rounded-lg p-4 transition-all cursor-pointer focus:outline-none active:outline-none ${
        isHovered
          ? 'border-amber-500 shadow-md scale-[1.02]'
          : 'border-amber-200 hover:border-amber-300 hover:shadow-sm'
      }`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{typeIcon}</span>
          <h3 className="font-bold text-gray-900 text-sm truncate">
            {circle.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusConfig.className}`}
          >
            {isFull ? 'Full' : statusConfig.label}
          </span>
          {!circle.isVirtual && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" strokeWidth={2} />
              <span>{circle.distanceKm.toFixed(1)}km</span>
            </div>
          )}
          {circle.isVirtual && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold uppercase tracking-wide">
              Online
            </span>
          )}
        </div>
      </div>

      {/* Host */}
      {circle.creatorName && (
        <p className="text-xs text-gray-600 mb-2">
          Hosted by <span className="font-medium">{circle.creatorName}</span>
        </p>
      )}

      {/* Attendance & Tags */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Users className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="font-medium">{attendanceText} brothers</span>
        </div>
        {circle.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
        See Details
        <ArrowRight className="w-3 h-3" strokeWidth={2} />
      </div>
    </div>
  );
}
