'use client';

import { Shield } from 'lucide-react';

export function CommissioningScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 z-50 flex items-center justify-center">
      <div className="text-center max-w-md px-8">
        {/* Animated Shield Icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto bg-blue-600/20 rounded-full flex items-center justify-center animate-pulse">
            <Shield className="w-10 h-10 text-blue-400" strokeWidth={2} />
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Setting up your profile, brother...
          </h2>
          <p className="text-blue-200 text-base">
            Preparing your place in the fellowship.
          </p>
        </div>

        {/* Loading bar */}
        <div className="mt-8 w-full bg-blue-900/50 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full animate-loading-bar"></div>
        </div>
      </div>
    </div>
  );
}
