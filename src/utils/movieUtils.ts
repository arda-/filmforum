/**
 * Movie-related utility functions for calendar display and filtering
 */

export interface Movie {
  Movie: string;
  Time: string;
  Tickets: string;
  Datetime: string;
  year?: string;
  director?: string;
  runtime?: string;
  actors?: string;
  description?: string;
  country?: string;
  film_url?: string;
  poster_url?: string;
  _col?: number;
  _hasOverlap?: boolean;
}

/**
 * Converts a string to title case (first letter of each word capitalized)
 * Preserves acronyms (all-caps words) and roman numerals
 */
export function toTitleCase(str: string): string {
  // Common roman numerals pattern (I, II, III, IV, V, VI, VII, VIII, IX, X, etc.)
  const romanNumeralPattern = /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)$/i;

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

/**
 * Parses a time string to minutes since midnight
 * Handles FF Jr. (morning) shows and assumes other times are PM
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
 * Assigns overlap columns to movies that overlap in time
 * Used for timeline view to display overlapping movies side by side
 */
export function assignOverlapColumns(movies: Movie[]): Movie[] {
  const sorted = [...movies].sort(
    (a, b) => parseTimeToMins(a.Time) - parseTimeToMins(b.Time)
  );
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

/**
 * Work hours constants (in minutes since midnight)
 */
export const WORK_START = 9 * 60; // 9:00 AM = 540 mins
export const WORK_END = 17 * 60; // 5:00 PM = 1020 mins

/**
 * Checks if a date is a weekday (Mon-Fri)
 */
export function isWeekday(date: string): boolean {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

/**
 * Checks if a movie showtime falls within work hours (9am-5pm)
 */
export function isWorkHours(timeStr: string): boolean {
  const mins = parseTimeToMins(timeStr);
  return mins >= WORK_START && mins < WORK_END;
}

/**
 * Filters movies to get only those during weekday work hours (9am-5pm Mon-Fri)
 */
export function getHiddenWorkHoursMovies(allMovies: Movie[]): Movie[] {
  return allMovies.filter((movie) => {
    const date = movie.Datetime.split('T')[0];
    if (!isWeekday(date)) return false;
    return isWorkHours(movie.Time);
  });
}

/**
 * Filters movies to get only those on weekdays (Mon-Fri)
 */
export function getWeekdayMovies(allMovies: Movie[]): Movie[] {
  return allMovies.filter((movie) => {
    const date = movie.Datetime.split('T')[0];
    return isWeekday(date);
  });
}

/**
 * Filters movies for after-hours availability (outside 9-5 on weekdays, all times on weekends)
 */
export function filterAfterHoursMovies(movies: Movie[], date: string): Movie[] {
  if (!isWeekday(date)) return movies;
  return movies.filter((m) => !isWorkHours(m.Time));
}

/**
 * Gets the time range (start, end, range in minutes) for a list of movies
 */
export function getDayTimeRange(movies: Movie[]): {
  start: number;
  end: number;
  range: number;
} {
  let minStart = Infinity;
  let maxEnd = 0;
  movies.forEach((m) => {
    const start = parseTimeToMins(m.Time);
    const runtime = parseInt(m.runtime || '90');
    const end = start + runtime;
    if (start < minStart) minStart = start;
    if (end > maxEnd) maxEnd = end;
  });
  return { start: minStart, end: maxEnd, range: maxEnd - minStart };
}
