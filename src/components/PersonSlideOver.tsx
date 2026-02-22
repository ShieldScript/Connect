'use client';

import { X } from 'lucide-react';

interface PersonSlideOverProps {
  fellow: {
    name: string;
    archetype: string;
    skills: Array<{ name: string; level: number }>;
    bio?: string;
    connectionProtocol?: string;
    distanceKm: number;
  };
  dotY: number; // Y position of the dot on the map
  mapHeight: number; // Height of the map container
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function PersonSlideOver({ fellow, dotY, mapHeight, onClose, onMouseEnter, onMouseLeave }: PersonSlideOverProps) {
  // Calculate vertical position - align card top with dot Y position
  // dotY is the SVG coordinate, we need to convert to screen pixels
  // The map container starts at some offset from the top, and dotY is relative to the map
  const topPixels = dotY;

  // Categorize skills by proficiency level
  const mentorSkills = fellow.skills.filter(s => s.level === 3);
  const practitionerSkills = fellow.skills.filter(s => s.level === 2);
  const learnerSkills = fellow.skills.filter(s => s.level === 1);

  return (
    <>

      {/* Slide-over card */}
      <div
        className="fixed right-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto pointer-events-auto"
        style={{
          top: `${topPixels}px`,
          maxHeight: '70vh',
          animation: 'slideInFromRight 0.3s ease-out',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <style jsx>{`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%) translateY(-50%);
              opacity: 0;
            }
            to {
              transform: translateX(0) translateY(-50%);
              opacity: 1;
            }
          }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {fellow.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-blue-600 font-semibold uppercase tracking-wide">
                {fellow.archetype}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {fellow.distanceKm.toFixed(1)}km away
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 p-1 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Bio */}
          {fellow.bio && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                About
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {fellow.bio}
              </p>
            </div>
          )}

          {/* Skills - Grouped by proficiency */}
          {fellow.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Stewardship Toolkit
              </h3>

              <div className="space-y-3">
                {/* Mentor Skills */}
                {mentorSkills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Mentor
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {mentorSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded border border-amber-300 text-xs font-bold whitespace-nowrap flex-shrink-0"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practitioner Skills */}
                {practitionerSkills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Practitioner
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {practitionerSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs font-semibold whitespace-nowrap flex-shrink-0"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learner Skills */}
                {learnerSkills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Learning
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {learnerSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded border border-gray-200 text-xs whitespace-nowrap flex-shrink-0"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* How to Connect */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              How to Connect
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {fellow.connectionProtocol ||
                'Connect through community channels or in-person gatherings.'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
