'use client';

interface HoverBriefCardProps {
  fellow: {
    name: string;
    archetype: string;
    skills: Array<{ name: string; level: number }>;
    connectionProtocol?: string;
  };
  x: number; // Position on map
  y: number;
  mapCenterX: number;
  mapCenterY: number;
}

export function HoverBriefCard({ fellow, x, y, mapCenterX, mapCenterY }: HoverBriefCardProps) {
  // Position card to the right or left of the dot depending on which half of the compass
  const isLeftSide = x < mapCenterX;
  const cardX = isLeftSide ? x + 30 : x - 280; // 250px card width + 30px offset
  const cardY = y - 60; // Center vertically on the dot

  // Get top 3 skills
  const topSkills = [...fellow.skills]
    .sort((a, b) => b.level - a.level)
    .slice(0, 3);

  console.log('HoverBriefCard rendering:', {
    fellow: fellow.name,
    position: { x, y, cardX, cardY },
    isLeftSide,
    topSkillsCount: topSkills.length
  });

  return (
    <g>
      {/* Anchor Line - Faint dotted connection from dot to card */}
      <line
        x1={x}
        y1={y}
        x2={isLeftSide ? x + 25 : x - 25}
        y2={cardY + 60}
        stroke="#CBD5E1"
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.4"
      />

      {/* Card Container - Light Glassmorphism */}
      <foreignObject
        x={cardX}
        y={cardY}
        width="250"
        height="200"
        className="pointer-events-none overflow-visible"
      >
        <div {...({ xmlns: "http://www.w3.org/1999/xhtml" } as any)} className="bg-white backdrop-blur-md rounded-lg border border-slate-200 shadow-lg overflow-hidden w-full">
          {/* Header - Thin blue top border instead of black block */}
          <div className="px-3 py-2 border-b border-slate-200 bg-white border-t-2 border-t-blue-500">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {fellow.name.split(' ')[0]}
              </h3>
              <span className="text-slate-400">•</span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase">
                {fellow.archetype}
              </span>
            </div>
          </div>

          {/* Toolkit - Muted grey chips */}
          {topSkills.length > 0 && (
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/30">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Toolkit
              </div>
              <div className="flex flex-wrap gap-1">
                {topSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-medium"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How to Connect - Highlighted soft blue box */}
          <div className="px-3 py-2 bg-blue-50/60 border-t border-blue-100">
            <div className="text-[9px] font-bold text-blue-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              How to Connect
            </div>
            <p className="text-[11px] text-slate-700 leading-tight">
              {fellow.connectionProtocol ||
                'Connect through community channels or in-person gatherings.'}
            </p>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}
