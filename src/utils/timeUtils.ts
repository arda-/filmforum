/**
 * Time-related utilities for the Film Forum calendar
 *
 * NOTE: This file is currently unused but maintained for potential future use.
 * All implementations have been centralized in calendarTime.ts.
 */

// Import and re-export centralized utilities from calendarTime.ts
export {
  type Movie,
  parseTimeToMins,
  getDayTimeRange,
  formatDateTime,
  formatShowtime,
} from './calendarTime';

// Type alias for backwards compatibility
export interface DayTimeRange {
  start: number;
  end: number;
  range: number;
}
