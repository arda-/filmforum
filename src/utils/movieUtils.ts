/**
 * Movie-related utility functions for calendar display and filtering
 */

import type { Movie, Showtime, GroupedMovie, AggregationResult } from '../types/movie';

// Re-export types for backwards compatibility
export type { Movie, Showtime, GroupedMovie, AggregationResult };

// Common roman numerals pattern (I, II, III, IV, V, VI, VII, VIII, IX, X, etc.)
const romanNumeralPattern = /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)$/i;

/**
 * Converts a string to title case (first letter of each word capitalized)
 * Preserves acronyms (all-caps words) and roman numerals
 */
export function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map((w) => {
      // Preserve words that are all uppercase (likely acronyms)
      if (w === w.toUpperCase() && w.length > 1 && /[A-Z]/.test(w)) {
        return w;
      }
      // Preserve roman numerals
      if (romanNumeralPattern.test(w)) {
        return w.toUpperCase();
      }
      // Normal title case
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

// --- Movie aggregation for "Showing Today" ---

/**
 * Finds the next showing date (>= todayStr, or wraps to earliest available)
 * and groups movies for that date by title, collecting their showtimes.
 * Skips entries that have no poster_url.
 */
export function aggregateMoviesForDate(
  movieData: Movie[],
  todayStr: string,
): AggregationResult {
  const allDates = [...new Set(movieData.map(m => m.Datetime.split('T')[0]))].sort();

  if (allDates.length === 0) {
    return { targetDate: '', movies: [] };
  }

  const targetDate = allDates.find(d => d >= todayStr) || allDates[0];
  const dayMovies = movieData.filter(m => m.Datetime.split('T')[0] === targetDate);

  const movieMap = new Map<string, GroupedMovie>();
  for (const m of dayMovies) {
    if (!m.poster_url) continue;
    const existing = movieMap.get(m.Movie);
    if (existing) {
      existing.showtimes.push({ time: m.Time, tickets: m.Tickets });
    } else {
      movieMap.set(m.Movie, {
        film: m,
        showtimes: [{ time: m.Time, tickets: m.Tickets }],
      });
    }
  }

  return { targetDate, movies: [...movieMap.values()] };
}

/**
 * Formats runtime string for display (e.g., "120 minutes" -> "120min")
 */
export function formatRuntime(runtime: string | undefined): string {
  if (!runtime) return '';
  return runtime.replace(' minutes', 'min').replace(' ', '');
}

// --- Time parsing and work hours ---

/**
 * Work hours constants (in minutes since midnight)
 */
export const WORK_START = 9 * 60; // 9:00 AM
export const WORK_END = 17 * 60; // 5:00 PM

/**
 * Parses a time string to minutes since midnight.
 * Handles formats like:
 * - "1:00" -> 13:00 (1 PM)
 * - "7:30" -> 19:30 (7:30 PM)
 * - "12:00" -> 12:00 (noon)
 * - "10:00 FF Jr" -> 10:00 (10 AM, morning shows)
 * - "11:30 FF Jr" -> 11:30 (11:30 AM)
 */
export function parseTimeToMins(timeStr: string): number {
  if (!timeStr) return 0;

  const ffJr = timeStr.includes('FF Jr');
  const cleanTime = timeStr.replace('FF Jr', '').trim();

  const match = cleanTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);

  if (ffJr) {
    // FF Jr means morning show (AM)
    return hours * 60 + mins;
  } else {
    // Default to PM times (film forum typically shows evening films)
    // 12:xx is already PM (noon)
    if (hours === 12) {
      return hours * 60 + mins;
    }
    // Convert to 24-hour format for PM
    if (hours < 12) {
      hours += 12;
    }
    return hours * 60 + mins;
  }
}

/**
 * Checks if a date string is a weekday (Mon-Fri)
 */
export function isWeekday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day >= 1 && day <= 5; // 0 = Sunday, 6 = Saturday
}

/**
 * Checks if a time string falls within work hours (9 AM - 5 PM)
 */
export function isWorkHours(timeStr: string): boolean {
  const mins = parseTimeToMins(timeStr);
  return mins >= WORK_START && mins < WORK_END;
}

// --- Movie filtering by time ---

/**
 * Returns movies that fall on weekdays during work hours
 */
export function getHiddenWorkHoursMovies(movies: Movie[]): Movie[] {
  return movies.filter(m => {
    const dateStr = m.Datetime.split('T')[0];
    return isWeekday(dateStr) && isWorkHours(m.Time);
  });
}

/**
 * Returns only movies that are on weekdays
 */
export function getWeekdayMovies(movies: Movie[]): Movie[] {
  return movies.filter(m => {
    const dateStr = m.Datetime.split('T')[0];
    return isWeekday(dateStr);
  });
}

/**
 * Filters movies based on work hours:
 * - Weekends: returns all movies
 * - Weekdays: returns only non-work-hour movies
 */
export function filterAfterHoursMovies(movies: Movie[], dateStr: string): Movie[] {
  if (!isWeekday(dateStr)) {
    return movies; // Weekend: show all
  }
  // Weekday: filter out work hours
  return movies.filter(m => !isWorkHours(m.Time));
}

// --- Overlap detection and time ranges ---

/**
 * Calculates the time range for a day's movies
 */
export function getDayTimeRange(movies: Movie[]): { start: number; end: number; range: number } {
  if (movies.length === 0) {
    return { start: 0, end: 0, range: 0 };
  }

  let start = Infinity;
  let end = 0;

  for (const movie of movies) {
    const startMins = parseTimeToMins(movie.Time);
    const runtime = parseInt(movie.runtime || '0', 10);
    const endMins = startMins + runtime;

    start = Math.min(start, startMins);
    end = Math.max(end, endMins);
  }

  return {
    start,
    end,
    range: end - start,
  };
}

/**
 * Assigns overlap columns to movies based on their showtimes.
 * Movies that overlap in time get different column numbers.
 * Returns movies with added _col and _hasOverlap properties.
 */
export function assignOverlapColumns(movies: Movie[]): (Movie & { _col: number; _hasOverlap: boolean })[] {
  if (movies.length === 0) return [];

  // Parse movies with start and end times
  const parsed = movies.map(m => {
    const start = parseTimeToMins(m.Time);
    const runtime = parseInt(m.runtime || '0', 10);
    const end = start + runtime;
    return { movie: m, start, end, col: 0 };
  });

  // Sort by start time
  parsed.sort((a, b) => a.start - b.start);

  // Track which columns are occupied up to what time
  const columnEndTimes: number[] = [];

  // Assign columns using greedy algorithm
  for (const item of parsed) {
    // Find first available column
    let col = 0;
    for (let i = 0; i < columnEndTimes.length; i++) {
      if (columnEndTimes[i] <= item.start) {
        col = i;
        break;
      }
      col = i + 1;
    }

    item.col = col;
    columnEndTimes[col] = item.end;
  }

  // Check if any overlaps exist
  const hasAnyOverlap = parsed.some(p => p.col > 0);

  // Return results with _col and _hasOverlap
  return movies.map(m => {
    const parsed_item = parsed.find(p => p.movie === m)!;
    return {
      ...m,
      _col: parsed_item.col,
      _hasOverlap: hasAnyOverlap,
    };
  });
}

