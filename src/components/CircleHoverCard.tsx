'use client';

interface CircleHoverCardProps {
  circle: {
    id?: string;
    name: string;
    type: string;
    hostName?: string;
    currentSize: number;
    maxSize?: number | null;
    description?: string;
    tags?: string[];
    howToJoin?: string;
    createdBy?: string;
  };
  x: number; // Position on map
  y: number;
  mapCenterX: number;
  mapCenterY: number;
  currentUserId?: string;
}

export function CircleHoverCard({ circle, x, y, mapCenterX, mapCenterY, currentUserId }: CircleHoverCardProps) {
  // Position card to the right or left of the dot depending on which half of the compass
  const isLeftSide = x < mapCenterX;
  const cardX = isLeftSide ? x + 30 : x - 280; // 250px card width + 30px offset
  const cardY = y - 60; // Center vertically on the dot

  const attendanceText = circle.maxSize
    ? `${circle.currentSize}/${circle.maxSize} FELLOWS`
    : `${circle.currentSize} FELLOWS`;

  const isOwnCircle = currentUserId && circle.createdBy === currentUserId;

  console.log('CircleHoverCard rendering:', {
    circle: circle.name,
    position: { x, y, cardX, cardY },
    isLeftSide,
    attendance: attendanceText,
    isOwnCircle
  });

  return (
    <g>
      {/* Anchor Line - Faint dotted connection from dot to card */}
      <line
        x1={x}
        y1={y}
        x2={isLeftSide ? x + 25 : x - 25}
        y2={cardY + 60}
        stroke="#FDB022"
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.4"
      />

      {/* Card Container - Light Glassmorphism with Amber Accent */}
      <foreignObject
        x={cardX}
        y={cardY}
        width="250"
        height="200"
        className="pointer-events-none overflow-visible"
      >
        <div {...({ xmlns: "http://www.w3.org/1999/xhtml" } as any)} className="bg-white backdrop-blur-md rounded-lg border border-amber-200 shadow-lg overflow-hidden w-full">
          {/* Header - Thin amber top border */}
          <div className="px-3 py-2 border-b border-amber-200 bg-white border-t-2 border-t-amber-500">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {circle.name}
              </h3>
            </div>

            {/* Attendance Progress Bar (Game HUD aesthetic) */}
            {circle.maxSize && (
              <div className="mb-1.5">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${Math.min((circle.currentSize / circle.maxSize) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {circle.hostName && (
              <p className="text-[10px] text-slate-600">
                Hosted by <span className="font-semibold">{circle.hostName}</span>
              </p>
            )}
          </div>

          {/* Social Proof - Attendance Count */}
          <div className="px-3 py-2 border-b border-amber-100 bg-amber-50/30">
            <div className="text-[9px] font-bold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              {attendanceText} ATTENDING
            </div>
            {circle.description && (
              <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">
                {circle.description}
              </p>
            )}
          </div>

          {/* Tags */}
          {circle.tags && circle.tags.length > 0 && (
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/30">
              <div className="flex flex-wrap gap-1">
                {circle.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How to Join OR Manage Button */}
          {isOwnCircle ? (
            <div className="px-3 py-2 bg-green-50 border-t border-green-200">
              <a
                href="/"
                className="block w-full py-2 bg-green-600 hover:bg-green-700 text-white text-center rounded text-[11px] font-bold uppercase tracking-wide transition"
              >
                ⚙️ Manage in Dashboard
              </a>
            </div>
          ) : (
            <div className="px-3 py-2 bg-amber-50/60 border-t border-amber-100">
              <div className="text-[9px] font-bold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                How to Join
              </div>
              <p className="text-[11px] text-slate-700 leading-tight">
                {circle.howToJoin ||
                  'Contact the host for details on how to join this circle.'}
              </p>
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}
