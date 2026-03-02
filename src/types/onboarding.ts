/**
 * Type definitions for onboarding flow
 */

export type PrivacyLevel = 'PUBLIC' | 'GROUP' | 'PRIVATE';

export type SensitivityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ActivitySelection {
  activityId: string;
  proficiency: number; // 1-5
  privacy: PrivacyLevel;
}

export interface LayerSelection {
  optionId: string;
  level: number; // 1-5
  privacy: PrivacyLevel;
  customValue?: string;
}

export interface OnboardingData {
  // Step 2: Identity
  displayName: string;
  bio: string;

  // Step 3: Location
  community: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;

  // Step 4: Activities
  activities: ActivitySelection[];

  // Spiritual Layers (Steps 5-15)
  naturalGiftings: LayerSelection[];
  supernaturalGiftings: LayerSelection[];
  ministryExperiences: LayerSelection[];
  milestones: LayerSelection[];
  growthAreas: LayerSelection[];
  leadershipPatterns: LayerSelection[];
  lifeStages: LayerSelection[];
  callings: LayerSelection[];
  healingThemes: LayerSelection[];
  practices: LayerSelection[];
  boundaries: LayerSelection[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  activities: Activity[];
}

export interface Activity {
  id: string;
  name: string;
  categoryId: string;
}

export interface EnumOption {
  value: string;
  label: string;
}

export interface OnboardingApiResponse {
  success: boolean;
  data?: {
    categories: Category[];
    enums: {
      giftingTypes: EnumOption[];
      supernaturalGiftTypes: EnumOption[];
      ministryTypes: EnumOption[];
      milestoneTypes: EnumOption[];
      growthAreaTypes: EnumOption[];
      leadershipStyles: EnumOption[];
      lifeStageTypes: EnumOption[];
      callingTypes: EnumOption[];
      healingThemeTypes: EnumOption[];
      practiceTypes: EnumOption[];
      boundaryTypes: EnumOption[];
    };
  };
  error?: string;
}

export interface ProficiencyLabels {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
}
