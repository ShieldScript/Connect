import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ===== TYPES =====

export interface ActivitySelection {
  activityId: string;
  proficiency: number; // 1-5
  privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
}

export interface LayerSelection {
  optionId: string;
  level: number; // 1-5
  privacy: 'PUBLIC' | 'GROUP' | 'PRIVATE';
  customValue?: string;
}

export interface OnboardingState {
  // Step tracking
  currentStep: number;
  completedSteps: number[];

  // Step 1: Welcome (no data)

  // Step 2: Identity
  displayName: string;
  bio: string;

  // Step 3: Location
  community: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;

  // Step 4: Interests (Enum-based, same as other layers)
  interests: Map<string, LayerSelection>;

  // Step 5: HEXACO-60 Assessment
  hexacoResponses: Map<number, number>; // questionId (1-60) → score (1-5)
  hexacoCurrentQuestion: number; // 0-59 tracking
  hexacoCurrentBatch: number; // 1-6 tracking

  // Layer 1: Natural Giftings (now step 6)
  naturalGiftings: Map<string, LayerSelection>;

  // Layer 2: Supernatural Giftings
  supernaturalGiftings: Map<string, LayerSelection>;

  // Layer 3: Ministry Experience
  ministryExperiences: Map<string, LayerSelection>;

  // Layer 4: Spiritual Milestones
  milestones: Map<string, LayerSelection>;

  // Layer 5: Areas of Growth & Need
  growthAreas: Map<string, LayerSelection>;

  // Layer 6: Leadership Patterns
  leadershipPatterns: Map<string, LayerSelection>;

  // Layer 7: Life Stage Themes
  lifeStages: Map<string, LayerSelection>;

  // Layer 8: Calling Trajectories
  callings: Map<string, LayerSelection>;

  // Layer 9: Wounds & Healing Themes
  healingThemes: Map<string, LayerSelection>;

  // Layer 10: Rhythms & Practices
  practices: Map<string, LayerSelection>;

  // Layer 11: Boundaries & Availability
  boundaries: Map<string, LayerSelection>;

  // Step 16: Covenant
  covenantAgreed: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;

  // Identity actions
  setIdentity: (data: { displayName: string; bio: string }) => void;

  // Location actions
  setLocation: (data: {
    community: string;
    city: string;
    region: string;
    latitude?: number;
    longitude?: number;
  }) => void;

  // Interest actions
  setInterest: (optionId: string, selection: LayerSelection | null) => void;

  // HEXACO actions
  setHexacoResponse: (questionId: number, score: 1 | 2 | 3 | 4 | 5) => void;
  setHexacoCurrentQuestion: (index: number) => void;
  setHexacoCurrentBatch: (batch: number) => void;
  calculateHexacoScores: () => { H: number; E: number; X: number; A: number; C: number; O: number } | null;

  // Layer actions
  setNaturalGifting: (optionId: string, selection: LayerSelection | null) => void;
  setSupernaturalGifting: (optionId: string, selection: LayerSelection | null) => void;
  setMinistryExperience: (optionId: string, selection: LayerSelection | null) => void;
  setMilestone: (optionId: string, selection: LayerSelection | null) => void;
  setGrowthArea: (optionId: string, selection: LayerSelection | null) => void;
  setLeadershipPattern: (optionId: string, selection: LayerSelection | null) => void;
  setLifeStage: (optionId: string, selection: LayerSelection | null) => void;
  setCalling: (optionId: string, selection: LayerSelection | null) => void;
  setHealingTheme: (optionId: string, selection: LayerSelection | null) => void;
  setPractice: (optionId: string, selection: LayerSelection | null) => void;
  setBoundary: (optionId: string, selection: LayerSelection | null) => void;

  // Covenant action
  setCovenantAgreed: (agreed: boolean) => void;

  // Utility actions
  reset: () => void;
  canProceedToNextStep: (step: number) => boolean;
}

// ===== INITIAL STATE =====

const initialState = {
  currentStep: 1,
  completedSteps: [],

  // Identity
  displayName: '',
  bio: '',

  // Location
  community: '',
  city: '',
  region: '',
  latitude: undefined,
  longitude: undefined,

  // Interests
  interests: new Map<string, LayerSelection>(),

  // HEXACO
  hexacoResponses: new Map<number, number>(),
  hexacoCurrentQuestion: 0,
  hexacoCurrentBatch: 1,

  // Layers
  naturalGiftings: new Map<string, LayerSelection>(),
  supernaturalGiftings: new Map<string, LayerSelection>(),
  ministryExperiences: new Map<string, LayerSelection>(),
  milestones: new Map<string, LayerSelection>(),
  growthAreas: new Map<string, LayerSelection>(),
  leadershipPatterns: new Map<string, LayerSelection>(),
  lifeStages: new Map<string, LayerSelection>(),
  callings: new Map<string, LayerSelection>(),
  healingThemes: new Map<string, LayerSelection>(),
  practices: new Map<string, LayerSelection>(),
  boundaries: new Map<string, LayerSelection>(),

  // Covenant
  covenantAgreed: false,
};

// ===== VALIDATION =====

const canProceedToNextStep = (state: OnboardingState, step: number): boolean => {
  switch (step) {
    case 1: // Welcome - always can proceed
      return true;

    case 2: // Identity - require name
      return state.displayName.trim().length > 0;

    case 3: // Location - require city and region
      return state.city.trim().length > 0 && state.region.trim().length > 0;

    case 4: // Interests - require at least 3 selections
      return state.interests.size >= 3;

    case 5: // HEXACO-60 - require all 60 responses (non-skippable)
      return state.hexacoResponses.size === 60;

    case 6: // Natural Giftings - optional (skippable)
      return true;

    case 7: // Supernatural Giftings - optional (skippable)
      return true;

    case 8: // Ministry Experience - optional (skippable)
      return true;

    case 9: // Milestones - optional (skippable)
      return true;

    case 10: // Growth Areas - optional (skippable)
      return true;

    case 11: // Leadership Patterns - optional (skippable)
      return true;

    case 12: // Life Stages - optional (skippable)
      return true;

    case 13: // Callings - optional (skippable)
      return true;

    case 14: // Healing Themes - optional (skippable)
      return true;

    case 15: // Practices - optional (skippable)
      return true;

    case 16: // Boundaries - optional (skippable)
      return true;

    case 17: // Covenant - require agreement
      return state.covenantAgreed;

    case 18: // Review - always can proceed
      return true;

    default:
      return false;
  }
};

// ===== STORE =====

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Step navigation
      setCurrentStep: (step) => set({ currentStep: step }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])],
        })),

      // Identity
      setIdentity: (data) =>
        set({
          displayName: data.displayName,
          bio: data.bio,
        }),

      // Location
      setLocation: (data) =>
        set({
          community: data.community,
          city: data.city,
          region: data.region,
          latitude: data.latitude,
          longitude: data.longitude,
        }),

      // Interests
      setInterest: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.interests);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { interests: newMap };
        }),

      // HEXACO
      setHexacoResponse: (questionId, score) =>
        set((state) => {
          const newMap = new Map(state.hexacoResponses);
          newMap.set(questionId, score);
          return { hexacoResponses: newMap };
        }),

      setHexacoCurrentQuestion: (index) => set({ hexacoCurrentQuestion: index }),

      setHexacoCurrentBatch: (batch) => set({ hexacoCurrentBatch: batch }),

      calculateHexacoScores: () => {
        const state = get();
        if (state.hexacoResponses.size < 60) return null;

        // Import scoring logic dynamically or implement inline
        // For now, return null - will be implemented in scoring file
        return null;
      },

      // Layer setters
      setNaturalGifting: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.naturalGiftings);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { naturalGiftings: newMap };
        }),

      setSupernaturalGifting: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.supernaturalGiftings);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { supernaturalGiftings: newMap };
        }),

      setMinistryExperience: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.ministryExperiences);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { ministryExperiences: newMap };
        }),

      setMilestone: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.milestones);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { milestones: newMap };
        }),

      setGrowthArea: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.growthAreas);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { growthAreas: newMap };
        }),

      setLeadershipPattern: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.leadershipPatterns);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { leadershipPatterns: newMap };
        }),

      setLifeStage: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.lifeStages);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { lifeStages: newMap };
        }),

      setCalling: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.callings);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { callings: newMap };
        }),

      setHealingTheme: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.healingThemes);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { healingThemes: newMap };
        }),

      setPractice: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.practices);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { practices: newMap };
        }),

      setBoundary: (optionId, selection) =>
        set((state) => {
          const newMap = new Map(state.boundaries);
          if (selection) {
            newMap.set(optionId, selection);
          } else {
            newMap.delete(optionId);
          }
          return { boundaries: newMap };
        }),

      // Covenant
      setCovenantAgreed: (agreed) => set({ covenantAgreed: agreed }),

      // Utilities
      reset: () => set(initialState),

      canProceedToNextStep: (step) => canProceedToNextStep(get(), step),
    }),
    {
      name: 'brotherhood-connect-onboarding',
      storage: createJSONStorage(() => localStorage),
      // Custom serializer to handle Map objects
      partialize: (state) => ({
        ...state,
        interests: Array.from(state.interests.entries()),
        hexacoResponses: Array.from(state.hexacoResponses.entries()),
        naturalGiftings: Array.from(state.naturalGiftings.entries()),
        supernaturalGiftings: Array.from(state.supernaturalGiftings.entries()),
        ministryExperiences: Array.from(state.ministryExperiences.entries()),
        milestones: Array.from(state.milestones.entries()),
        growthAreas: Array.from(state.growthAreas.entries()),
        leadershipPatterns: Array.from(state.leadershipPatterns.entries()),
        lifeStages: Array.from(state.lifeStages.entries()),
        callings: Array.from(state.callings.entries()),
        healingThemes: Array.from(state.healingThemes.entries()),
        practices: Array.from(state.practices.entries()),
        boundaries: Array.from(state.boundaries.entries()),
      }),
      // Custom deserializer to restore Map objects
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert arrays back to Maps
          state.interests = new Map(state.interests as any);
          state.hexacoResponses = new Map(state.hexacoResponses as any);
          state.naturalGiftings = new Map(state.naturalGiftings as any);
          state.supernaturalGiftings = new Map(state.supernaturalGiftings as any);
          state.ministryExperiences = new Map(state.ministryExperiences as any);
          state.milestones = new Map(state.milestones as any);
          state.growthAreas = new Map(state.growthAreas as any);
          state.leadershipPatterns = new Map(state.leadershipPatterns as any);
          state.lifeStages = new Map(state.lifeStages as any);
          state.callings = new Map(state.callings as any);
          state.healingThemes = new Map(state.healingThemes as any);
          state.practices = new Map(state.practices as any);
          state.boundaries = new Map(state.boundaries as any);
        }
      },
    }
  )
);
