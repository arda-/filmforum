/**
 * Calendar filtering logic.
 * Functions for filtering movies by availability (work hours, weekends)
 * and by saved reaction status.
 */

import type { Movie } from './icsGenerator';
import { WORK_START, WORK_END, HOURS_FILTER_MODE, type HoursFilterMode, type SavedFilter } from '../constants';
import { parseTimeToMins } from './calendarTime';
import type { ReactionMap } from '../types/session';
import { movieId } from './sessionUtils';

/** Get movies hidden by the "after 5pm" work-hours filter. */
export function getHiddenWorkHoursMovies(allMovies: Movie[]): Movie[] {
  return allMovies.filter(movie => {
    const date = movie.Datetime.split('T')[0];
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    if (!isWeekday) return false;
    const mins = parseTimeToMins(movie.Time);
    return mins >= WORK_START && mins < WORK_END;
  });
}

/** Get all weekday movies (hidden by "weekends only" filter). */
export function getWeekdayMovies(allMovies: Movie[]): Movie[] {
  return allMovies.filter(movie => {
    const date = movie.Datetime.split('T')[0];
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  });
}

/** Update the filter status text showing how many showtimes/films are hidden. */
export function updateHoursFilterStatus(
  mode: HoursFilterMode,
  allMovies: Movie[]
): void {
  const statusEl = document.getElementById('hours-filter-status');
  if (!statusEl) return;

  if (mode === HOURS_FILTER_MODE.NONE) {
    statusEl.textContent = '';
    statusEl.style.display = 'none';
    return;
  }

  const hiddenMovies = mode === HOURS_FILTER_MODE.WEEKENDS
    ? getWeekdayMovies(allMovies)
    : getHiddenWorkHoursMovies(allMovies);
  const uniqueTitles = new Set(hiddenMovies.map(m => m.Movie));
  statusEl.textContent = `(${hiddenMovies.length} showtimes, ${uniqueTitles.size} films hidden)`;
  statusEl.style.display = 'inline';
}

/**
 * Filter a day's movies based on filter mode and day of week.
 * Returns the filtered movie list for a given date.
 */
export function filterDayMovies(
  dayMovies: Movie[],
  dateStr: string,
  hoursFilterMode: HoursFilterMode
): Movie[] {
  const dayOfWeek = new Date(dateStr + 'T12:00:00').getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  if (hoursFilterMode === HOURS_FILTER_MODE.WEEKENDS && isWeekday) {
    return [];
  }

  if (hoursFilterMode === HOURS_FILTER_MODE.AFTERHOURS && isWeekday) {
    return dayMovies.filter(m => {
      const mins = parseTimeToMins(m.Time);
      return mins < WORK_START || mins >= WORK_END;
    });
  }

  return dayMovies;
}

/**
 * Filter movies by saved reaction status.
 * When activeSavedFilters includes all 4 categories, no filtering occurs.
 */
export function filterBySavedStatus(
  movies: Movie[],
  reactions: ReactionMap,
  activeSavedFilters: SavedFilter[]
): Movie[] {
  // All 4 checked = show everything (no filter active)
  if (activeSavedFilters.length === 4) return movies;
  // None checked = hide everything
  if (activeSavedFilters.length === 0) return [];

  const filterSet = new Set(activeSavedFilters);
  return movies.filter(movie => {
    const id = movieId(movie.Movie);
    const reaction = reactions[id] || 'none';
    if (reaction === 'none') return filterSet.has('unmarked');
    return filterSet.has(reaction as SavedFilter);
  });
}

/** Update the saved filter status text. */
export function updateSavedFilterStatus(
  activeSavedFilters: SavedFilter[],
  allMovies: Movie[],
  reactions: ReactionMap
): void {
  const statusEl = document.getElementById('saved-filter-status');
  if (!statusEl) return;

  if (activeSavedFilters.length === 4) {
    statusEl.textContent = '';
    statusEl.style.display = 'none';
    return;
  }

  const hiddenMovies = allMovies.filter(movie => {
    const id = movieId(movie.Movie);
    const reaction = reactions[id] || 'none';
    const category: SavedFilter = reaction === 'none' ? 'unmarked' : reaction as SavedFilter;
    return !activeSavedFilters.includes(category);
  });
  const uniqueTitles = new Set(hiddenMovies.map(m => m.Movie));
  statusEl.textContent = `(${hiddenMovies.length} showtimes, ${uniqueTitles.size} films hidden)`;
  statusEl.style.display = 'inline';
}
