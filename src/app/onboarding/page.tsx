'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Loader2 } from 'lucide-react';

const stepRoutes = [
  '/onboarding/welcome',              // Step 1
  '/onboarding/welcome',              // Step 1 (duplicate)
  '/onboarding/identity',             // Step 2
  '/onboarding/location',             // Step 3
  '/onboarding/interests',            // Step 4
  '/onboarding/hexaco-60',            // Step 5 - NEW
  '/onboarding/natural-giftings',     // Step 6 (was 5)
  '/onboarding/supernatural-giftings',// Step 7 (was 6)
  '/onboarding/ministry-experience',  // Step 8 (was 7)
  '/onboarding/milestones',           // Step 9 (was 8)
  '/onboarding/growth-areas',         // Step 10 (was 9)
  '/onboarding/leadership-patterns',  // Step 11 (was 10)
  '/onboarding/life-stages',          // Step 12 (was 11)
  '/onboarding/callings',             // Step 13 (was 12)
  '/onboarding/healing-themes',       // Step 14 (was 13)
  '/onboarding/practices',            // Step 15 (was 14)
  '/onboarding/boundaries',           // Step 16 (was 15)
  '/onboarding/covenant',             // Step 17 (was 16)
  '/onboarding/review',               // Step 18 (was 17)
];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentStep } = useOnboardingStore();

  useEffect(() => {
    // Redirect to the appropriate step
    const targetRoute = stepRoutes[currentStep] || '/onboarding/welcome';
    router.replace(targetRoute);
  }, [currentStep, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading onboarding...</p>
      </div>
    </div>
  );
}
