'use client';

import { useState, useEffect } from 'react';

interface WelcomeLetterModalProps {
  isMentor: boolean;
  archetypeName: string;
  primaryCraftName?: string;
  displayName: string;
  onDismiss: () => void;
}

export function WelcomeLetterModal({
  isMentor,
  archetypeName,
  primaryCraftName,
  displayName,
  onDismiss,
}: WelcomeLetterModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for fade-out animation before calling onDismiss
    setTimeout(onDismiss, 300);
  };

  const formatArchetype = (name: string): string => {
    if (!name) return 'Steward';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backdropFilter: isVisible ? 'blur(12px)' : 'blur(0px)',
        backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0)',
      }}
    >
      {/* Modal Card */}
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        {/* Decorative Top Border */}
        <div className="h-2 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700"></div>

        {/* Content */}
        <div className="px-8 py-10 md:px-12 md:py-12">
          {/* Header - Conditional based on path */}
          {/* Typography: Sans-Serif (Inter) for headers */}
          <div className="text-center mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-2 tracking-tight">
              {isMentor ? 'A Call to Stewardship' : 'The Strength of Humility'}
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest">
              YOUR INDUCTION INTO THE FELLOWSHIP
            </p>
          </div>

          {/* Body - Different message for Mentor vs Learner */}
          {/* Typography: Serif font (Merriweather/Playfair Display) for letter feel */}
          <div className="mb-8 space-y-6 text-gray-800 leading-relaxed">
            <p className="text-lg font-serif">
              <span className="font-semibold">Welcome to the line, {displayName}.</span>
            </p>

            {isMentor ? (
              <>
                {/* Version 2: The Mentor Letter */}
                <p className="text-lg font-serif">
                  You have been positioned as a <span className="font-semibold text-blue-900">Steward</span>. In this fellowship, we believe that your craft and your experience are trusts intended to strengthen the fold. Your presence here is not just for your own benefit, but for the sharpening of the brotherhood.
                </p>
                <p className="text-lg font-serif">
                  Your dashboard is now active. Look for brothers seeking the skills you carry, lead with humility, and let the work begin.
                </p>
              </>
            ) : (
              <>
                {/* Version 1: The Learner Letter */}
                <p className="text-lg font-serif">
                  You have entered a <span className="font-semibold text-blue-900">Season of Growth</span>. Every master was once a student, and every builder began by learning the weight of the tools. There is deep strength in the willingness to be sharpened by those who have walked before you.
                </p>
                <p className="text-lg font-serif">
                  Your dashboard is now active—explore the fellowship, find a mentor in your craft, and let the sharpening begin.
                </p>
              </>
            )}
          </div>

          {/* Scripture Reference (Optional but adds weight) */}
          <div className="mb-8 p-4 bg-gray-50 border-l-4 border-blue-700 rounded">
            <p className="text-sm font-serif italic text-gray-700">
              "As iron sharpens iron, so one person sharpens another."
            </p>
            <p className="text-xs text-gray-500 text-right mt-1">— Proverbs 27:17</p>
          </div>

          {/* Signature */}
          <div className="mb-8 text-center">
            <p className="text-base font-serif text-gray-700 mb-1">In Fellowship,</p>
            <p className="text-lg font-semibold text-blue-900">The Connect Brotherhood</p>
          </div>

          {/* Call to Action Button */}
          <div className="text-center">
            <button
              onClick={handleDismiss}
              className="px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-800 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
            >
              Enter the Fellowship
            </button>
          </div>
        </div>

        {/* Decorative Bottom Border */}
        <div className="h-2 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700"></div>
      </div>
    </div>
  );
}
