/**
 * Movie-related utility functions for calendar display and filtering
 */

// Import Movie type from calendarTime.ts
import { type Movie } from './calendarTime';

export type { Movie };

/**
 * Converts a string to title case (first letter of each word capitalized)
 */
export function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats runtime string for display (e.g., "120 minutes" -> "120min")
 */
export function formatRuntime(runtime: string | undefined): string {
  if (!runtime) return '';
  return runtime.replace(' minutes', 'min').replace(' ', '');
}

