/**
 * Calendar time parsing and range calculations.
 * Pure utility functions with no DOM or state dependencies.
 */

import type { Movie } from './icsGenerator';
import { DAYS } from '../constants';

/** Parse a time string (e.g. "2:10", "12:30 – FF Jr.") to minutes since midnight. */
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

/** Get the earliest start and latest end time for a day's movies. */
export function getDayTimeRange(movies: Movie[]) {
  let minStart = Infinity, maxEnd = 0;
  movies.forEach(m => {
    const start = parseTimeToMins(m.Time);
    const runtime = parseInt(m.runtime || '90');
    const end = start + runtime;
    if (start < minStart) minStart = start;
    if (end > maxEnd) maxEnd = end;
  });
  return { start: minStart, end: maxEnd, range: maxEnd - minStart };
}

/** Assign overlap columns for timeline mode (2-column layout for overlapping showtimes). */
export function assignOverlapColumns(movies: Movie[]) {
  const sorted = [...movies].sort((a, b) => parseTimeToMins(a.Time) - parseTimeToMins(b.Time));
  sorted.forEach((movie, i) => {
    movie._col = 0;
    movie._hasOverlap = false;
    const myStart = parseTimeToMins(movie.Time);
    for (let j = 0; j < i; j++) {
      const prev = sorted[j];
      const prevEnd = parseTimeToMins(prev.Time) + parseInt(prev.runtime || '90');
      if (prevEnd > myStart) {
        movie._col = 1;
        prev._hasOverlap = true;
        movie._hasOverlap = true;
        break;
      }
    }
  });
  return sorted;
}

/** Format a date string as "Mon 2/10". */
export function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const dayName = DAYS[d.getDay()];
  return `${dayName} ${month}/${day}`;
}

/** Format a datetime string as "Monday, February 10, 2:30 PM". */
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

/** Format a datetime string as just the time, e.g. "2:30 PM". */
export function formatShowtime(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Generate the full date range for the calendar grid.
 * Pads to complete weeks based on the week start preference.
 */
export function generateDateRange(movieDates: string[], mondayStart: boolean): string[] {
  if (movieDates.length === 0) return [];

  const sortedDates = [...movieDates].sort();
  const firstMovieDate = new Date(sortedDates[0] + 'T12:00:00');
  const lastMovieDate = new Date(sortedDates[sortedDates.length - 1] + 'T12:00:00');

  const firstDayOfWeek = firstMovieDate.getDay();
  const weekStartDay = mondayStart ? 1 : 0;

  let daysToSubtract = firstDayOfWeek - weekStartDay;
  if (daysToSubtract < 0) daysToSubtract += 7;

  const firstDate = new Date(firstMovieDate);
  firstDate.setDate(firstMovieDate.getDate() - daysToSubtract);

  const dates: string[] = [];
  const current = new Date(firstDate);

  while (current <= lastMovieDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  // Pad to complete the last week
  while (current.getDay() !== weekStartDay) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
