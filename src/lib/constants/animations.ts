/**
 * Animation timing constants
 * Centralized timing values for UI animations across the app
 */
export const ANIMATION_TIMINGS = {
  /** Delay between letters in welcome animation (ms) */
  WELCOME_LETTER_DELAY: 100,

  /** Duration to show highlight effects (ms) */
  HIGHLIGHT_DURATION: 2000,

  /** Delay before navigation redirect (ms) */
  NAVIGATION_DELAY: 500,

  /** Duration of pulse animation (ms) */
  PULSE_DURATION: 2000,

  /** Delay for toast/notification auto-dismiss (ms) */
  TOAST_DURATION: 3000,

  /** Duration for fade in/out transitions (ms) */
  FADE_DURATION: 300,

  /** Duration for slide animations (ms) */
  SLIDE_DURATION: 400,
} as const;

/**
 * Form field constraints
 * Centralized validation limits for form inputs
 */
export const FORM_CONSTRAINTS = {
  /** Maximum length for gathering/group title */
  TITLE_MAX: 100,

  /** Maximum length for description fields */
  DESCRIPTION_MAX: 300,

  /** Maximum length for protocol/rules text */
  PROTOCOL_MAX: 500,

  /** Maximum length for bio/about text */
  BIO_MAX: 500,

  /** Default gathering capacity */
  CAPACITY_DEFAULT: 12,

  /** Minimum gathering capacity */
  CAPACITY_MIN: 2,

  /** Maximum gathering capacity */
  CAPACITY_MAX: 100,

  /** Minimum display name length */
  DISPLAY_NAME_MIN: 2,

  /** Maximum display name length */
  DISPLAY_NAME_MAX: 50,

  /** Minimum interests to select */
  INTERESTS_MIN: 3,

  /** Maximum interests to select */
  INTERESTS_MAX: 20,

  /** Maximum location name length */
  LOCATION_NAME_MAX: 200,
} as const;

/**
 * UI Constants
 * Other UI-related constants
 */
export const UI_CONSTANTS = {
  /** Default items per page for pagination */
  ITEMS_PER_PAGE: 20,

  /** Maximum items per page */
  MAX_ITEMS_PER_PAGE: 100,

  /** Default proximity radius (km) */
  DEFAULT_PROXIMITY_KM: 5,

  /** Maximum proximity radius (km) */
  MAX_PROXIMITY_KM: 200,

  /** Sidebar width when open (pixels) */
  SIDEBAR_WIDTH_OPEN: 256,

  /** Sidebar width when collapsed (pixels) */
  SIDEBAR_WIDTH_COLLAPSED: 64,
} as const;

/**
 * Debounce delays for various inputs (ms)
 */
export const DEBOUNCE_DELAYS = {
  /** Search input debounce */
  SEARCH: 300,

  /** Form input validation debounce */
  VALIDATION: 500,

  /** Auto-save debounce */
  AUTO_SAVE: 1000,

  /** Resize event debounce */
  RESIZE: 150,
} as const;
