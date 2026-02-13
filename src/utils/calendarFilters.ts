/**
 * Calendar filtering logic.
 * Functions for filtering movies by time category and by saved reaction status.
 */

import type { Movie } from '../types/movie';
import { WORK_START, WORK_END, TIME_CATEGORY_COUNT, type TimeCategory, type SavedFilter, SAVED_FILTER_COUNT } from './calendarConstants';
import { parseTimeToMins } from './calendarTime';
import type { ReactionMap } from '../types/session';
import { movieId } from './sessionUtils';

/**
 * Classify a movie into a time category: weekdays, weeknights, or weekends.
 * - Weekdays: Mon-Fri, 9am-5pm
 * - Weeknights: Mon-Fri, before 9am or after 5pm
 * - Weekends: Sat-Sun, any time
 */
export function classifyTimeCategory(movie: Movie, dateStr: string): TimeCategory {
  const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isWeekend) return 'weekends';

  const mins = parseTimeToMins(movie.Time);
  if (mins >= WORK_START && mins < WORK_END) return 'weekdays';
  return 'weeknights';
}

/**
 * Filter a day's movies based on enabled time categories.
 * Each movie falls into exactly one category; it's shown if that category is enabled.
 * All categories enabled = show everything (fast path).
 */
export function filterByTimeCategories(
  dayMovies: Movie[],
  dateStr: string,
  enabledCategories: Set<TimeCategory>
): Movie[] {
  // All enabled = no filtering needed
  if (enabledCategories.size === TIME_CATEGORY_COUNT) return dayMovies;
  // None enabled = hide everything
  if (enabledCategories.size === 0) return [];

  return dayMovies.filter(m => enabledCategories.has(classifyTimeCategory(m, dateStr)));
}

/**
 * Filter movies by saved reaction status.
 * Accepts a pre-built Set to avoid re-creating it per day in the render loop.
 */
export function filterBySavedStatus(
  movies: Movie[],
  reactions: ReactionMap,
  filterSet: Set<SavedFilter>
): Movie[] {
  // All checked = show everything (no filter active)
  if (filterSet.size === SAVED_FILTER_COUNT) return movies;
  // None checked = hide everything
  if (filterSet.size === 0) return [];

  return movies.filter(movie => {
    const id = movieId(movie.Movie);
    const reaction = reactions[id] || 'none';
    if (reaction === 'none') return filterSet.has('unmarked');
    // Safe cast: 'none' is handled above, so reaction is 'yes' | 'maybe' | 'no'
    return filterSet.has(reaction as SavedFilter);
  });
}

/** Update the saved filter status text. */
export function updateSavedFilterStatus(
  filterSet: Set<SavedFilter>,
  allMovies: Movie[],
  reactions: ReactionMap
): void {
  const statusEl = document.getElementById('saved-filter-status');
  if (!statusEl) return;

  if (filterSet.size === SAVED_FILTER_COUNT) {
    statusEl.textContent = '';
    statusEl.style.display = 'none';
    return;
  }

  const hiddenMovies = allMovies.filter(movie => {
    const id = movieId(movie.Movie);
    const reaction = reactions[id] || 'none';
    const category: SavedFilter = reaction === 'none' ? 'unmarked' : reaction as SavedFilter;
    return !filterSet.has(category);
  });
  const uniqueTitles = new Set(hiddenMovies.map(m => m.Movie));
  statusEl.textContent = `(${hiddenMovies.length} showtimes, ${uniqueTitles.size} films hidden)`;
  statusEl.style.display = 'inline';
}
