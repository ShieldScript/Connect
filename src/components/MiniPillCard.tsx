'use client';

import { MapPin, Hammer, Shield, Compass, BookOpen, Wrench, Heart, Sparkles, Tent, Laugh, HandHeart, Crown, Users, Lightbulb, Palette } from 'lucide-react';

interface MiniPillCardProps {
  id: string;
  person: {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
    archetype?: string | null;
    interests?: { name: string; proficiencyLevel: number }[];
    bio?: string | null;
    distanceKm: number;
    connectionStyle?: string | null;
  };
  isHovered: boolean;
  isSelected: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}

export function MiniPillCard({
  id,
  person,
  isHovered,
  isSelected,
  onHover,
  onClick,
}: MiniPillCardProps) {
  // Get highest proficiency skill
  const leadSkill = person.interests
    ? [...person.interests].sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)[0]
    : null;

  // Get initials for avatar
  const initials = person.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Helper: Get archetype icon with unique icons per archetype
  const getArchetypeIcon = (archetype: string | null | undefined) => {
    if (!archetype) return <Users className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    const archetypeLower = archetype.toLowerCase();

    // Wisdom & Knowledge
    if (archetypeLower.includes('sage')) return <BookOpen className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Craft & Creation
    if (archetypeLower.includes('builder')) return <Hammer className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('artisan')) return <Palette className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('architect')) return <Lightbulb className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Protection & Service
    if (archetypeLower.includes('guardian') || archetypeLower.includes('warrior') || archetypeLower.includes('watchman'))
      return <Shield className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('steward')) return <Wrench className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('caregiver') || archetypeLower.includes('provider'))
      return <HandHeart className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Leadership & Direction
    if (archetypeLower.includes('ruler')) return <Crown className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('navigator') || archetypeLower.includes('guide'))
      return <Compass className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Exploration & Adventure
    if (archetypeLower.includes('scout') || archetypeLower.includes('explorer'))
      return <Tent className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Relationships & Connection
    if (archetypeLower.includes('lover') || archetypeLower.includes('encourager'))
      return <Heart className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Transformation & Joy
    if (archetypeLower.includes('magician')) return <Sparkles className="w-3 h-3 text-slate-500" strokeWidth={2} />;
    if (archetypeLower.includes('jester')) return <Laugh className="w-3 h-3 text-slate-500" strokeWidth={2} />;

    // Default
    return <Users className="w-3 h-3 text-slate-500" strokeWidth={2} />;
  };

  return (
    <div
      id={id}
      className={`rounded-lg border transition-all cursor-pointer ${
        isSelected
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
        {/* Avatar */}
        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate mb-0.5">
            {person.displayName}
          </h3>

          {person.archetype && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              {getArchetypeIcon(person.archetype)}
              <span className="capitalize">{person.archetype}</span>
            </div>
          )}
        </div>

        {/* Distance - Right-aligned */}
        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
          <MapPin className="w-3 h-3" strokeWidth={2} />
          <span className="font-medium">{person.distanceKm.toFixed(1)}km</span>
        </div>
      </div>
    </div>
  );
}
