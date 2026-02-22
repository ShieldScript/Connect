'use client';

import { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface FieldBriefProps {
  fellow: {
    name: string;
    archetype: string;
    bearing?: number;
    distance: number;
    status?: string;
    bio?: string;
    skills: Array<{
      name: string;
      level: number;
    }>;
    connectionProtocol?: string;
    connectionStyle?: string;
  };
  onClose: () => void;
}

// Map skill level to proficiency label
function getProficiencyLabel(level: number): string {
  if (level >= 4) return 'Mentor';
  if (level >= 3) return 'Practitioner';
  return 'Beginner';
}

// Calculate bearing direction (N, NE, E, SE, S, SW, W, NW)
function getDirection(bearing: number): string {
  if (bearing < 22.5 || bearing >= 337.5) return 'N';
  if (bearing < 67.5) return 'NE';
  if (bearing < 112.5) return 'E';
  if (bearing < 157.5) return 'SE';
  if (bearing < 202.5) return 'S';
  if (bearing < 247.5) return 'SW';
  if (bearing < 292.5) return 'W';
  return 'NW';
}

export function FieldBrief({ fellow, onClose }: FieldBriefProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showScanline, setShowScanline] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    setTimeout(() => setIsVisible(true), 10);

    // Trigger scanline effect after slide-in
    setTimeout(() => {
      setShowScanline(true);
      setTimeout(() => setShowScanline(false), 1000);
    }, 400);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for slide-out animation
  };

  const handleCopyProtocol = () => {
    const protocol = fellow.connectionProtocol ||
      `Connect with ${fellow.name} - ${fellow.archetype}\n\nDistance: ${fellow.distance.toFixed(1)}km away\n\n${fellow.bio || 'No connection details provided.'}`;

    navigator.clipboard.writeText(protocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const direction = fellow.bearing ? getDirection(fellow.bearing) : 'N';
  const bearingDisplay = fellow.bearing ? `${fellow.bearing.toFixed(0).padStart(3, '0')}°` : '000°';

  // Group skills by proficiency
  const skillsByProficiency = {
    Mentor: fellow.skills.filter(s => s.level >= 4),
    Practitioner: fellow.skills.filter(s => s.level >= 3 && s.level < 4),
    Beginner: fellow.skills.filter(s => s.level < 3),
  };

  return (
    <>
      {/* Overlay - Dims the map by 20% but keeps targeting brackets visible */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Field Brief Panel - Slides from right with pointer events */}
      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          transition: 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)', // Hydraulic easing
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scanline Effect */}
        {showScanline && (
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-10"
            style={{
              animation: 'scanline 1s ease-out',
            }}
          />
        )}

        {/* Header: Tactical Summary */}
        <div className="bg-slate-900 text-white px-6 py-5 border-b border-slate-700">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  {fellow.name.split(' ')[0]}
                </h2>
                <span className="text-slate-400">•</span>
                <span className="text-sm font-semibold text-blue-400 uppercase">
                  {fellow.archetype}
                </span>
              </div>
              <div className="font-mono text-xs text-slate-400">TARGET IDENTITY</div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-slate-800 rounded transition"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Vector Data */}
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <div className="font-mono text-xs text-slate-500 mb-0.5">BEARING</div>
              <div className="font-mono text-base font-bold text-green-400">
                {bearingDisplay} ({direction})
              </div>
            </div>
            <div>
              <div className="font-mono text-xs text-slate-500 mb-0.5">RANGE</div>
              <div className="font-mono text-base font-bold text-green-400">
                {fellow.distance.toFixed(1)}km
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mt-3">
            <div className="font-mono text-xs text-slate-500">SIGNAL</div>
            <div className="flex items-center gap-2">
              <div className="relative w-2 h-2">
                <div className="absolute w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="font-mono text-xs font-bold text-green-400">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Craft Philosophy */}
          {fellow.bio && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Craft Philosophy
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "{fellow.bio}"
              </p>
            </section>
          )}

          {/* Connection Style */}
          {fellow.connectionStyle && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                The Intent
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {fellow.connectionStyle}
              </p>
            </section>
          )}

          {/* Stewardship Toolkit */}
          {fellow.skills.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                Stewardship Toolkit
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-2 font-bold text-slate-700 text-xs uppercase">
                        Proficiency
                      </th>
                      <th className="text-left px-4 py-2 font-bold text-slate-700 text-xs uppercase">
                        Craft
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(skillsByProficiency).map(([proficiency, skills]) =>
                      skills.map((skill, idx) => (
                        <tr key={`${proficiency}-${idx}`} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-4 py-3 font-semibold text-slate-600">
                            {proficiency}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {skill.name}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* How to Connect - Highlighted */}
          <section className="border-2 border-blue-200 bg-blue-50/50 rounded-lg p-4">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              How to Connect
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed space-y-2">
              {fellow.connectionProtocol ? (
                <p>{fellow.connectionProtocol}</p>
              ) : (
                <>
                  <p className="font-semibold">HOW TO CONNECT:</p>
                  <p className="italic text-slate-600">
                    "Connection details not yet configured. Reach out through the community channels or in-person gatherings."
                  </p>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Footer: Quick Actions */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex gap-3">
          <button
            onClick={handleCopyProtocol}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wide rounded transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2.5} />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" strokeWidth={2.5} />
                Copy Info
              </>
            )}
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm uppercase tracking-wide rounded transition"
          >
            Close Brief
          </button>
        </div>
      </div>

      {/* CSS Animation for Scanline */}
      <style jsx>{`
        @keyframes scanline {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </>
  );
}
