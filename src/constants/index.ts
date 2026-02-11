/**
 * Calendar and timeline display constants
 */

// Days of the week (Sunday-indexed to match JavaScript Date.getDay())
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export type DayName = typeof DAYS[number];

// Timeline scaling factor (pixels per minute)
export const PX_PER_MIN = 0.7;

// Timeline height constants
export const MIN_TIMELINE_HEIGHT = 100; // Minimum day cell height in pixels
export const TIMELINE_PADDING = 32;    // Day header padding in pixels

// Work hours in minutes from midnight
export const WORK_START = 9 * 60;   // 9:00 AM = 540 minutes
export const WORK_END = 17 * 60;    // 5:00 PM = 1020 minutes

/**
 * Filter mode constants
 */

// Hours filter modes for availability filtering
export const HOURS_FILTER_MODE = {
  NONE: 'none',
  AFTERHOURS: 'afterhours',
  WEEKENDS: 'weekends',
} as const;
export type HoursFilterMode = typeof HOURS_FILTER_MODE[keyof typeof HOURS_FILTER_MODE];

// Single showtimes filter modes
export const SINGLE_SHOWTIMES_MODE = {
  NONE: 'none',
  HIGHLIGHT: 'highlight',
  ONLY: 'only',
} as const;
export type SingleShowtimesMode = typeof SINGLE_SHOWTIMES_MODE[keyof typeof SINGLE_SHOWTIMES_MODE];

// Saved movie filter categories
export const SAVED_FILTER = {
  YES: 'yes',
  MAYBE: 'maybe',
  NO: 'no',
  UNMARKED: 'unmarked',
} as const;
export type SavedFilter = typeof SAVED_FILTER[keyof typeof SAVED_FILTER];

// All saved filter values, derived from the object so it stays in sync
export const ALL_SAVED_FILTERS = Object.values(SAVED_FILTER);
export const SAVED_FILTER_COUNT = ALL_SAVED_FILTERS.length;

