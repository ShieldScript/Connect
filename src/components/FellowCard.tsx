'use client';

import { ArrowRight, MapPin, Hammer, Shield, Compass, BookOpen, Wrench, Heart, Sparkles, Tent, Laugh, HandHeart, Crown, Users, Lightbulb, Palette } from 'lucide-react';

interface FellowCardProps {
  person: {
    id: string;
    displayName: string;
    profileImageUrl: string | null;
    archetype?: string | null;
    interests?: { name: string; proficiencyLevel: number }[];
    distanceKm: number;
  };
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}

export function FellowCard({ person, isHovered, onHover, onClick }: FellowCardProps) {
  // Get highest proficiency skill
  const highestSkill = person.interests
    ? [...person.interests].sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)[0]
    : null;

  // Count remaining interests
  const remainingInterestsCount = person.interests ? person.interests.length - 1 : 0;

  // Get initials for avatar
  const initials = person.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Helper to get proficiency label
  const getProficiencyLabel = (level: number): string => {
    if (level === 3) return 'Mentor';
    if (level === 2) return 'Practitioner';
    return 'Learner';
  };

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
      className={`bg-white border rounded-lg p-4 transition-all cursor-pointer focus:outline-none active:outline-none ${
        isHovered
          ? 'border-blue-500 shadow-md scale-[1.02]'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {person.displayName}
              </h3>
              {person.archetype && (
                <div className="flex items-center gap-1">
                  {getArchetypeIcon(person.archetype)}
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                    {person.archetype}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
              <MapPin className="w-3 h-3" strokeWidth={2} />
              <span>{person.distanceKm.toFixed(1)}km</span>
            </div>
          </div>

          {highestSkill && (
            <div className="text-xs text-gray-600 mb-2">
              {highestSkill.name} ({getProficiencyLabel(highestSkill.proficiencyLevel)})
              {remainingInterestsCount > 0 && (
                <span className="ml-1 text-gray-500">+{remainingInterestsCount}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
            View Profile
            <ArrowRight className="w-3 h-3" strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
