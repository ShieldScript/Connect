'use client';

import { X, Mail, Phone, MessageCircle, MapPin } from 'lucide-react';

interface ProtocolModalProps {
  fellow: {
    name: string;
    archetype: string;
    skills: { name: string; level: number }[];
    bio?: string;
    distance?: number;
    contactMethods?: {
      email?: string;
      phone?: string;
      signal?: string;
      whatsapp?: string;
    };
    availability?: string;
    connectionStyle?: string;
  };
  onClose: () => void;
}

export function ProtocolModal({ fellow, onClose }: ProtocolModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            How to Connect
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Profile Summary */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
                {fellow.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{fellow.name}</h3>
                <p className="text-sm text-gray-500 uppercase tracking-wide">{fellow.archetype}</p>
                {fellow.distance && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                    <span className="text-xs text-gray-500">{fellow.distance.toFixed(1)}km away</span>
                  </div>
                )}
              </div>
            </div>

            {fellow.bio && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {fellow.bio}
              </p>
            )}

            {/* Skills - Sectioned by Proficiency with Horizontal Scroll */}
            <div className="space-y-3">
              {/* Mentor Skills */}
              {fellow.skills.filter(s => s.level === 3).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Mentor
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {fellow.skills
                        .filter(s => s.level === 3)
                        .map((skill) => (
                          <span
                            key={`${skill.name}-${skill.level}`}
                            className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded border border-amber-300 text-sm font-bold whitespace-nowrap flex-shrink-0"
                          >
                            {skill.name}
                          </span>
                        ))}
                  </div>
                </div>
              )}

              {/* Practitioner Skills */}
              {fellow.skills.filter(s => s.level === 2).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Practitioner
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {fellow.skills
                        .filter(s => s.level === 2)
                        .map((skill) => (
                          <span
                            key={`${skill.name}-${skill.level}`}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-sm font-semibold whitespace-nowrap flex-shrink-0"
                          >
                            {skill.name}
                          </span>
                        ))}
                  </div>
                </div>
              )}

              {/* Learner Skills */}
              {fellow.skills.filter(s => s.level === 1).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Learning
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {fellow.skills
                        .filter(s => s.level === 1)
                        .map((skill) => (
                          <span
                            key={`${skill.name}-${skill.level}`}
                            className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded border border-gray-200 text-sm whitespace-nowrap flex-shrink-0"
                          >
                            {skill.name}
                          </span>
                        ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Connection Details */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-bold text-gray-900 mb-3">
              Preferred Contact Methods
            </h4>

            {fellow.contactMethods ? (
              <div className="space-y-3">
                {fellow.contactMethods.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">Email</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {fellow.contactMethods.email}
                      </div>
                    </div>
                  </div>
                )}

                {fellow.contactMethods.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">Phone</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {fellow.contactMethods.phone}
                      </div>
                    </div>
                  </div>
                )}

                {fellow.contactMethods.signal && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-600" strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">Signal</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {fellow.contactMethods.signal}
                      </div>
                    </div>
                  </div>
                )}

                {/* Availability */}
                {fellow.availability && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs font-bold text-blue-900 mb-1">Availability</div>
                    <div className="text-sm text-blue-700">{fellow.availability}</div>
                  </div>
                )}

                {/* Connection Style */}
                {fellow.connectionStyle && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Prefers</div>
                    <div className="text-sm font-semibold text-gray-900">{fellow.connectionStyle}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500">
                  This brother hasn't set up their contact protocol yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
