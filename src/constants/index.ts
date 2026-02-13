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

// Time category filter (multi-select)
export const TIME_CATEGORY = {
  WEEKDAYS: 'weekdays',
  WEEKNIGHTS: 'weeknights',
  WEEKENDS: 'weekends',
} as const;
export type TimeCategory = typeof TIME_CATEGORY[keyof typeof TIME_CATEGORY];
export const ALL_TIME_CATEGORIES = Object.values(TIME_CATEGORY);
export const TIME_CATEGORY_COUNT = ALL_TIME_CATEGORIES.length;

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
