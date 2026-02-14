// @vitest-environment jsdom
/**
 * Test suite for calendar filter logic.
 * Tests time category classification, saved-status filtering,
 * and the DOM-based status text updater.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  classifyTimeCategory,
  filterByTimeCategories,
  filterBySavedStatus,
  updateSavedFilterStatus,
} from './calendarFilters';
import type { Movie } from '../types/movie';
import type { ReactionMap } from '../types/session';
import type { TimeCategory, SavedFilter } from './calendarConstants';

// --- Helpers ---

function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    Movie: 'Test Film',
    Time: '7:00',
    Tickets: 'https://example.com',
    Datetime: '2026-02-11T19:00:00',
    ...overrides,
  };
}

// --- classifyTimeCategory ---

describe('classifyTimeCategory', () => {
  it('should classify Saturday movies as weekends', () => {
    const movie = makeMovie({ Time: '2:00' });
    expect(classifyTimeCategory(movie, '2026-02-14')).toBe('weekends'); // Saturday
  });

  it('should classify Sunday movies as weekends', () => {
    const movie = makeMovie({ Time: '12:00' });
    expect(classifyTimeCategory(movie, '2026-02-15')).toBe('weekends'); // Sunday
  });

  it('should classify weekday daytime movies as weekdays', () => {
    // 12:00 PM = 720 min, within WORK_START (540) and WORK_END (1020)
    const movie = makeMovie({ Time: '12:00' });
    expect(classifyTimeCategory(movie, '2026-02-11')).toBe('weekdays'); // Wednesday
  });

  it('should classify weekday morning FF Jr shows as weekdays', () => {
    // 10:00 AM = 600 min, within work hours
    const movie = makeMovie({ Time: '10:00 FF Jr' });
    expect(classifyTimeCategory(movie, '2026-02-11')).toBe('weekdays');
  });

  it('should classify weekday evening movies as weeknights', () => {
    // 7:00 PM = 1140 min, after WORK_END (1020)
    const movie = makeMovie({ Time: '7:00' });
    expect(classifyTimeCategory(movie, '2026-02-11')).toBe('weeknights');
  });

  it('should classify weekday early morning shows as weeknights', () => {
    // 8:00 AM FF Jr = 480 min, before WORK_START (540)
    const movie = makeMovie({ Time: '8:00 FF Jr' });
    expect(classifyTimeCategory(movie, '2026-02-11')).toBe('weeknights');
  });

  it('should classify 5:00 PM weekday as weeknights (WORK_END boundary)', () => {
    // 5:00 PM = 1020 min, >= WORK_END so classified as weeknights
    const movie = makeMovie({ Time: '5:00' });
    expect(classifyTimeCategory(movie, '2026-02-11')).toBe('weeknights');
  });

  it('should classify 9:00 AM weekday as weekdays (WORK_START boundary)', () => {
    // 9:00 AM FF Jr = 540 min, exactly WORK_START (inclusive)
    const movie = makeMovie({ Time: '9:00 FF Jr' });
    expect(classifyTimeCategory(movie, '2026-02-11')).toBe('weekdays');
  });
});

// --- filterByTimeCategories ---

describe('filterByTimeCategories', () => {
  const weekdayDate = '2026-02-11'; // Wednesday
  const weekendDate = '2026-02-14'; // Saturday

  const movies: Movie[] = [
    makeMovie({ Movie: 'Morning Show', Time: '10:00 FF Jr', Datetime: '2026-02-11T10:00:00' }),
    makeMovie({ Movie: 'Afternoon Show', Time: '1:00', Datetime: '2026-02-11T13:00:00' }),
    makeMovie({ Movie: 'Evening Show', Time: '7:00', Datetime: '2026-02-11T19:00:00' }),
  ];

  it('should return all movies when all categories enabled (fast path)', () => {
    const all = new Set<TimeCategory>(['weekdays', 'weeknights', 'weekends']);
    const result = filterByTimeCategories(movies, weekdayDate, all);
    expect(result).toBe(movies); // Same reference (fast path)
  });

  it('should return empty array when no categories enabled (fast path)', () => {
    const none = new Set<TimeCategory>();
    const result = filterByTimeCategories(movies, weekdayDate, none);
    expect(result).toEqual([]);
  });

  it('should filter to only weekday-classified movies', () => {
    const weekdaysOnly = new Set<TimeCategory>(['weekdays']);
    const result = filterByTimeCategories(movies, weekdayDate, weekdaysOnly);
    // 10:00 AM and 1:00 PM are within work hours → weekdays
    expect(result).toHaveLength(2);
    expect(result.map(m => m.Movie)).toEqual(['Morning Show', 'Afternoon Show']);
  });

  it('should filter to only weeknight-classified movies', () => {
    const weeknightsOnly = new Set<TimeCategory>(['weeknights']);
    const result = filterByTimeCategories(movies, weekdayDate, weeknightsOnly);
    // 7:00 PM is after work hours → weeknights
    expect(result).toHaveLength(1);
    expect(result[0].Movie).toBe('Evening Show');
  });

  it('should return all weekend movies when weekends enabled', () => {
    const weekendMovies: Movie[] = [
      makeMovie({ Movie: 'Sat Morning', Time: '10:00 FF Jr', Datetime: '2026-02-14T10:00:00' }),
      makeMovie({ Movie: 'Sat Night', Time: '9:00', Datetime: '2026-02-14T21:00:00' }),
    ];
    const weekendsOnly = new Set<TimeCategory>(['weekends']);
    const result = filterByTimeCategories(weekendMovies, weekendDate, weekendsOnly);
    expect(result).toHaveLength(2);
  });

  it('should return no weekend movies when only weekdays/weeknights enabled', () => {
    const weekendMovies: Movie[] = [
      makeMovie({ Movie: 'Sat Show', Time: '7:00', Datetime: '2026-02-14T19:00:00' }),
    ];
    const noWeekends = new Set<TimeCategory>(['weekdays', 'weeknights']);
    const result = filterByTimeCategories(weekendMovies, weekendDate, noWeekends);
    expect(result).toHaveLength(0);
  });
});

// --- filterBySavedStatus ---

describe('filterBySavedStatus', () => {
  const movies: Movie[] = [
    makeMovie({ Movie: 'Film A' }),
    makeMovie({ Movie: 'Film B' }),
    makeMovie({ Movie: 'Film C' }),
    makeMovie({ Movie: 'Film D' }),
  ];

  // movieId normalizes: "Film A" → "film-a", etc.
  const reactions: ReactionMap = {
    'film-a': 'yes',
    'film-b': 'maybe',
    'film-c': 'no',
    // film-d has no reaction → 'unmarked'
  };

  it('should return all movies when all filters enabled (fast path)', () => {
    const allFilters = new Set<SavedFilter>(['yes', 'maybe', 'no', 'unmarked']);
    const result = filterBySavedStatus(movies, reactions, allFilters);
    expect(result).toBe(movies); // Same reference
  });

  it('should return empty when no filters enabled (fast path)', () => {
    const noFilters = new Set<SavedFilter>();
    const result = filterBySavedStatus(movies, reactions, noFilters);
    expect(result).toEqual([]);
  });

  it('should filter to only "yes" movies', () => {
    const yesOnly = new Set<SavedFilter>(['yes']);
    const result = filterBySavedStatus(movies, reactions, yesOnly);
    expect(result).toHaveLength(1);
    expect(result[0].Movie).toBe('Film A');
  });

  it('should filter to only "unmarked" movies', () => {
    const unmarkedOnly = new Set<SavedFilter>(['unmarked']);
    const result = filterBySavedStatus(movies, reactions, unmarkedOnly);
    expect(result).toHaveLength(1);
    expect(result[0].Movie).toBe('Film D');
  });

  it('should filter to multiple categories', () => {
    const yesAndMaybe = new Set<SavedFilter>(['yes', 'maybe']);
    const result = filterBySavedStatus(movies, reactions, yesAndMaybe);
    expect(result).toHaveLength(2);
    expect(result.map(m => m.Movie)).toEqual(['Film A', 'Film B']);
  });

  it('should handle empty reactions (all unmarked)', () => {
    const emptyReactions: ReactionMap = {};
    const unmarkedOnly = new Set<SavedFilter>(['unmarked']);
    const result = filterBySavedStatus(movies, emptyReactions, unmarkedOnly);
    expect(result).toHaveLength(4);
  });
});

// --- updateSavedFilterStatus ---

describe('updateSavedFilterStatus', () => {
  const movies: Movie[] = [
    makeMovie({ Movie: 'Film A' }),
    makeMovie({ Movie: 'Film B' }),
    makeMovie({ Movie: 'Film C' }),
    makeMovie({ Movie: 'Film D' }),
  ];

  const reactions: ReactionMap = {
    'film-a': 'yes',
    'film-b': 'maybe',
    'film-c': 'no',
  };

  let statusEl: HTMLElement;

  beforeEach(() => {
    statusEl = document.createElement('span');
    statusEl.id = 'saved-filter-status';
    document.body.appendChild(statusEl);

    return () => {
      statusEl.remove();
    };
  });

  it('should hide status when all filters are enabled', () => {
    const allFilters = new Set<SavedFilter>(['yes', 'maybe', 'no', 'unmarked']);
    updateSavedFilterStatus(allFilters, movies, reactions);
    expect(statusEl.textContent).toBe('');
    expect(statusEl.style.display).toBe('none');
  });

  it('should show hidden count when some filters are disabled', () => {
    // Only show "yes" — hides Film B (maybe), Film C (no), Film D (unmarked)
    const yesOnly = new Set<SavedFilter>(['yes']);
    updateSavedFilterStatus(yesOnly, movies, reactions);
    expect(statusEl.textContent).toContain('3 showtimes');
    expect(statusEl.textContent).toContain('3 films hidden');
    expect(statusEl.style.display).toBe('inline');
  });

  it('should count unique titles separately from showtimes', () => {
    // Two showtimes of the same film
    const moviesWithDupe: Movie[] = [
      makeMovie({ Movie: 'Film A', Datetime: '2026-02-11T14:00:00' }),
      makeMovie({ Movie: 'Film A', Datetime: '2026-02-11T19:00:00' }),
      makeMovie({ Movie: 'Film B' }),
    ];
    const rxn: ReactionMap = { 'film-a': 'yes', 'film-b': 'no' };

    // Only show "yes" — hides Film B (1 showtime, 1 film)
    const yesOnly = new Set<SavedFilter>(['yes']);
    updateSavedFilterStatus(yesOnly, moviesWithDupe, rxn);
    expect(statusEl.textContent).toContain('1 showtimes');
    expect(statusEl.textContent).toContain('1 films hidden');
  });

  it('should do nothing when status element is missing', () => {
    statusEl.remove();
    const yesOnly = new Set<SavedFilter>(['yes']);
    // Should not throw
    updateSavedFilterStatus(yesOnly, movies, reactions);
  });
});
