/**
 * Client-side localStorage cleanup utility
 *
 * Migrates old customLabel fields to customValue
 * Removes entries with orphaned numeric IDs
 */

export function cleanupOnboardingStorage() {
  if (typeof window === 'undefined') return;

  try {
    const storageKey = 'onboarding-storage';
    const rawData = localStorage.getItem(storageKey);

    if (!rawData) return;

    const data = JSON.parse(rawData);
    const state = data?.state;

    if (!state) return;

    let hasChanges = false;

    // Helper to clean a Map stored as array of [key, value] pairs
    const cleanMap = (mapArray: any[]) => {
      if (!Array.isArray(mapArray)) return mapArray;

      return mapArray.filter(([key, value]) => {
        // Remove entries with orphaned numeric IDs (timestamps without CUSTOM_ prefix)
        if (/^\d+$/.test(key)) {
          console.log(`🧹 Removing orphaned numeric ID: ${key}`);
          hasChanges = true;
          return false;
        }

        // Migrate customLabel to customValue
        if (value && typeof value === 'object') {
          if ('customLabel' in value) {
            console.log(`🔄 Migrating customLabel to customValue for: ${key}`);
            value.customValue = value.customLabel;
            delete value.customLabel;
            hasChanges = true;
          }

          // Clean customValue: strip numeric timestamps (e.g., "Problem Solving, 1772170456039" → "Problem Solving")
          if (value.customValue && typeof value.customValue === 'string') {
            const cleaned = value.customValue.replace(/,?\s*\d{10,}\s*$/g, '').trim();
            if (cleaned !== value.customValue) {
              console.log(`🧹 Cleaning numeric suffix from customValue: "${value.customValue}" → "${cleaned}"`);
              value.customValue = cleaned;
              hasChanges = true;
            }
          }
        }

        return true;
      });
    };

    // Clean all layer Maps
    const layerKeys = [
      'selectedActivities',
      'naturalGiftings',
      'supernaturalGiftings',
      'ministryExperiences',
      'milestones',
      'growthAreas',
      'leadershipPatterns',
      'lifeStages',
      'callings',
      'healingThemes',
      'practices',
      'boundaries',
    ];

    layerKeys.forEach((key) => {
      if (state[key]) {
        state[key] = cleanMap(state[key]);
      }
    });

    if (hasChanges) {
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log('✅ localStorage cleanup complete');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error cleaning localStorage:', error);
    return false;
  }
}

/**
 * Nuclear option: completely clear onboarding storage
 * Use this if migration fails or for testing
 */
export function clearOnboardingStorage() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('onboarding-storage');
    console.log('🗑️  Onboarding storage cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
    return false;
  }
}
