/**
 * Time-related utilities for the Film Forum calendar
 */

import type { Movie, DayTimeRange } from '../types/movie';

// Re-export for backwards compatibility
export type { Movie, DayTimeRange };

/**
 * Parse a time string to minutes since midnight
 * Handles AM/PM detection based on FF Jr. marker
 * @param timeStr - Time string like "2:30" or "10:30 FF Jr"
 * @returns Minutes since midnight
 */
export function parseTimeToMins(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  // FF Jr. shows are morning (AM)
  const isMorning = timeStr.includes('FF Jr');
  // 12:XX is always noon (PM), 1-11 without FF Jr are PM
  if (!isMorning && h !== 12 && h < 12) h += 12;
  return h * 60 + m;
}

/**
 * Get the time range for a day's movies
 * @param movies - Array of movies for the day
 * @returns Object with start, end, and range in minutes
 */
export function getDayTimeRange(movies: Movie[]): DayTimeRange {
  let minStart = Infinity;
  let maxEnd = 0;
  movies.forEach(m => {
    const start = parseTimeToMins(m.Time);
    const runtime = parseInt(m.runtime || '90');
    const end = start + runtime;
    if (start < minStart) minStart = start;
    if (end > maxEnd) maxEnd = end;
  });
  return { start: minStart, end: maxEnd, range: maxEnd - minStart };
}

/**
 * Format a datetime string for display
 * @param datetime - ISO datetime string
 * @returns Formatted string like "Monday, February 2, 2:30 PM"
 */
export function formatDateTime(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Format a datetime string to just the time
 * @param datetime - ISO datetime string
 * @returns Formatted time string like "2:30 PM"
 */
export function formatShowtime(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}
