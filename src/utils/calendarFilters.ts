/**
 * Calendar filtering logic.
 * Functions for filtering movies by availability (work hours, weekends).
 */

import type { Movie } from './icsGenerator';
import { WORK_START, WORK_END, HOURS_FILTER_MODE, type HoursFilterMode } from '../constants';
import { parseTimeToMins } from './calendarTime';

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
