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

// --- Movie aggregation for "Showing Today" ---

export interface Showtime {
  time: string;
  tickets?: string;
}

export interface GroupedMovie {
  film: Movie;
  showtimes: Showtime[];
}

export interface AggregationResult {
  targetDate: string;
  movies: GroupedMovie[];
}

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

