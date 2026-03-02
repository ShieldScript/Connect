/**
 * Onboarding Routes Configuration
 * Maps step numbers to route paths
 */

export const ONBOARDING_ROUTES = {
  1: '/onboarding/welcome',
  2: '/onboarding/identity',
  3: '/onboarding/location',
  4: '/onboarding/interests',
  5: '/onboarding/natural-giftings',
  6: '/onboarding/supernatural-giftings',
  7: '/onboarding/ministry-experience',
  8: '/onboarding/milestones',
  9: '/onboarding/growth-areas',
  10: '/onboarding/leadership-patterns',
  11: '/onboarding/life-stages',
  12: '/onboarding/callings',
  13: '/onboarding/healing-themes',
  14: '/onboarding/practices',
  15: '/onboarding/boundaries',
  16: '/onboarding/hexaco-60',
  17: '/onboarding/review',
  18: '/onboarding/dna-reveal',
  19: '/onboarding/code-of-conduct',
  20: '/onboarding/covenant',
} as const;

export const STEP_LABELS = {
  1: 'Welcome',
  2: 'Identity',
  3: 'Location',
  4: 'Interests',
  5: 'Natural Giftings',
  6: 'Supernatural Giftings',
  7: 'Ministry Experience',
  8: 'Spiritual Milestones',
  9: 'Growth Areas',
  10: 'Leadership Patterns',
  11: 'Life Stages',
  12: 'Calling Trajectories',
  13: 'Healing Themes',
  14: 'Rhythms & Practices',
  15: 'Boundaries',
  16: 'DNA Discovery',
  17: 'Review',
  18: 'DNA Reveal',
  19: 'Code of Conduct',
  20: 'Covenant',
} as const;

export const TOTAL_STEPS = 20;

export function getRouteForStep(step: number): string {
  return ONBOARDING_ROUTES[step as keyof typeof ONBOARDING_ROUTES] || '/onboarding/welcome';
}

export function getLabelForStep(step: number): string {
  return STEP_LABELS[step as keyof typeof STEP_LABELS] || 'Unknown';
}

export function isStepSkippable(step: number): boolean {
  // Steps 1-4, 16-20 are required (Identity, Location, Interests, DNA Discovery, Review, DNA Reveal, Code of Conduct, Covenant)
  // Steps 5-15 (all spiritual layers) are optional
  return step >= 5 && step <= 15;
}
