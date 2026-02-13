/**
 * Test suite for calendar time utilities.
 * Tests date range generation, week grouping, formatting, and overlap assignment.
 */

import { describe, it, expect } from 'vitest';
import {
  getDayTimeRange,
  assignOverlapColumns,
  formatDayLabel,
  formatShowtime,
  generateDateRange,
  groupDatesIntoWeeks,
  getWeekTimeRange,
} from './calendarTime';
import type { Movie } from '../types/movie';

// --- Helpers ---

function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    Movie: 'Test Film',
    Time: '7:00',
    Tickets: '',
    Datetime: '2026-02-11T19:00:00',
    runtime: '90',
    ...overrides,
  };
}

// --- getDayTimeRange ---

describe('getDayTimeRange', () => {
  it('should calculate range for a single movie', () => {
    const movies = [makeMovie({ Time: '7:00', runtime: '120' })];
    const result = getDayTimeRange(movies);
    expect(result.start).toBe(19 * 60); // 7 PM
    expect(result.end).toBe(19 * 60 + 120); // 9 PM
    expect(result.range).toBe(120);
  });

  it('should span from earliest to latest across multiple movies', () => {
    const movies = [
      makeMovie({ Time: '1:00', runtime: '90' }),  // 1 PM - 2:30 PM
      makeMovie({ Time: '7:00', runtime: '120' }), // 7 PM - 9 PM
    ];
    const result = getDayTimeRange(movies);
    expect(result.start).toBe(13 * 60);  // 1 PM
    expect(result.end).toBe(21 * 60);    // 9 PM
    expect(result.range).toBe(8 * 60);
  });

  it('should use default 90min runtime when not specified', () => {
    const movies = [makeMovie({ Time: '7:00', runtime: undefined })];
    const result = getDayTimeRange(movies);
    expect(result.end).toBe(19 * 60 + 90);
  });

  it('should handle FF Jr morning shows', () => {
    const movies = [makeMovie({ Time: '10:00 FF Jr', runtime: '90' })];
    const result = getDayTimeRange(movies);
    expect(result.start).toBe(10 * 60); // 10 AM
    expect(result.end).toBe(10 * 60 + 90);
  });
});

// --- assignOverlapColumns ---

describe('assignOverlapColumns', () => {
  it('should assign col 0 to non-overlapping movies', () => {
    const movies = [
      makeMovie({ Time: '1:00', runtime: '90' }),  // 1:00-2:30 PM
      makeMovie({ Time: '5:00', runtime: '90' }),  // 5:00-6:30 PM
    ];
    const result = assignOverlapColumns(movies);
    expect(result[0]._col).toBe(0);
    expect(result[0]._hasOverlap).toBe(false);
    expect(result[1]._col).toBe(0);
    expect(result[1]._hasOverlap).toBe(false);
  });

  it('should assign col 1 to overlapping movie', () => {
    const movies = [
      makeMovie({ Time: '1:00', runtime: '120' }), // 1:00-3:00 PM
      makeMovie({ Time: '2:00', runtime: '90' }),   // 2:00-3:30 PM
    ];
    const result = assignOverlapColumns(movies);
    expect(result[0]._col).toBe(0);
    expect(result[0]._hasOverlap).toBe(true);
    expect(result[1]._col).toBe(1);
    expect(result[1]._hasOverlap).toBe(true);
  });

  it('should sort by start time regardless of input order', () => {
    const movies = [
      makeMovie({ Movie: 'Late', Time: '9:00', runtime: '90' }),
      makeMovie({ Movie: 'Early', Time: '1:00', runtime: '90' }),
    ];
    const result = assignOverlapColumns(movies);
    // Result should be sorted: Early first, then Late
    expect(result[0].Movie).toBe('Early');
    expect(result[1].Movie).toBe('Late');
  });

  it('should handle empty array', () => {
    const result = assignOverlapColumns([]);
    expect(result).toEqual([]);
  });
});

// --- formatDayLabel ---

describe('formatDayLabel', () => {
  it('should format a Wednesday', () => {
    expect(formatDayLabel('2026-02-11')).toBe('Wed 2/11');
  });

  it('should format a Saturday', () => {
    expect(formatDayLabel('2026-02-14')).toBe('Sat 2/14');
  });

  it('should format a Sunday', () => {
    expect(formatDayLabel('2026-02-15')).toBe('Sun 2/15');
  });

  it('should format a date at the start of a month', () => {
    expect(formatDayLabel('2026-03-01')).toBe('Sun 3/1');
  });
});

// --- formatShowtime ---

describe('formatShowtime', () => {
  it('should format an evening showtime', () => {
    const result = formatShowtime('2026-02-11T19:00:00');
    expect(result).toBe('7:00 PM');
  });

  it('should format a noon showtime', () => {
    const result = formatShowtime('2026-02-11T12:30:00');
    expect(result).toBe('12:30 PM');
  });

  it('should format a morning showtime', () => {
    const result = formatShowtime('2026-02-11T10:00:00');
    expect(result).toBe('10:00 AM');
  });
});

// --- generateDateRange ---

describe('generateDateRange', () => {
  it('should return empty array for no dates', () => {
    expect(generateDateRange([], false)).toEqual([]);
  });

  it('should pad to complete weeks (Sunday start)', () => {
    // Feb 11-13, 2026 = Wed-Fri
    const dates = ['2026-02-11', '2026-02-12', '2026-02-13'];
    const result = generateDateRange(dates, false);
    // Should start from Sun 2/8 and end Sat 2/14
    expect(result[0]).toBe('2026-02-08'); // Sunday
    expect(result[result.length - 1]).toBe('2026-02-14'); // Saturday
    expect(result.length).toBe(7);
  });

  it('should pad to complete weeks (Monday start)', () => {
    // Feb 11-13, 2026 = Wed-Fri
    const dates = ['2026-02-11', '2026-02-12', '2026-02-13'];
    const result = generateDateRange(dates, true);
    // Should start from Mon 2/9 and end Sun 2/15
    expect(result[0]).toBe('2026-02-09'); // Monday
    expect(result[result.length - 1]).toBe('2026-02-15'); // Sunday
    expect(result.length).toBe(7);
  });

  it('should span multiple weeks when dates are far apart', () => {
    const dates = ['2026-02-11', '2026-02-20'];
    const result = generateDateRange(dates, true);
    // Should cover at least 2 full weeks
    expect(result.length % 7).toBe(0);
    expect(result.length).toBeGreaterThanOrEqual(14);
  });

  it('should sort dates regardless of input order', () => {
    const dates = ['2026-02-13', '2026-02-11'];
    const result = generateDateRange(dates, false);
    // First date should be before or on 2026-02-11
    expect(result[0] <= '2026-02-11').toBe(true);
  });
});

// --- groupDatesIntoWeeks ---

describe('groupDatesIntoWeeks', () => {
  it('should group 7 dates into 1 week', () => {
    const dates = ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13', '2026-02-14', '2026-02-15'];
    const weeks = groupDatesIntoWeeks(dates);
    expect(weeks).toHaveLength(1);
    expect(weeks[0]).toHaveLength(7);
  });

  it('should group 14 dates into 2 weeks', () => {
    const dates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(2026, 1, 9 + i);
      return d.toISOString().split('T')[0];
    });
    const weeks = groupDatesIntoWeeks(dates);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toHaveLength(7);
    expect(weeks[1]).toHaveLength(7);
  });

  it('should handle partial last week', () => {
    const dates = Array.from({ length: 10 }, (_, i) => {
      const d = new Date(2026, 1, 9 + i);
      return d.toISOString().split('T')[0];
    });
    const weeks = groupDatesIntoWeeks(dates);
    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toHaveLength(7);
    expect(weeks[1]).toHaveLength(3);
  });

  it('should return empty array for no dates', () => {
    expect(groupDatesIntoWeeks([])).toEqual([]);
  });
});

// --- getWeekTimeRange ---

describe('getWeekTimeRange', () => {
  it('should calculate range across all days in a week', () => {
    const moviesByDate: Record<string, Movie[]> = {
      '2026-02-09': [makeMovie({ Time: '7:00', runtime: '90' })],   // 7 PM
      '2026-02-10': [makeMovie({ Time: '1:00', runtime: '120' })],  // 1 PM
      '2026-02-11': [],
    };

    const weekDates = ['2026-02-09', '2026-02-10', '2026-02-11'];
    const result = getWeekTimeRange(weekDates, (date) => moviesByDate[date] || []);

    expect(result.start).toBe(13 * 60);   // 1 PM (earliest)
    expect(result.end).toBe(19 * 60 + 90); // 7 PM + 90min (latest)
  });

  it('should return zero range when no movies in any day', () => {
    const weekDates = ['2026-02-09', '2026-02-10'];
    const result = getWeekTimeRange(weekDates, () => []);
    expect(result).toEqual({ start: 0, end: 0, range: 0 });
  });

  it('should handle single day with movies', () => {
    const weekDates = ['2026-02-09'];
    const movies = [makeMovie({ Time: '7:00', runtime: '120' })];
    const result = getWeekTimeRange(weekDates, () => movies);
    expect(result.start).toBe(19 * 60);
    expect(result.end).toBe(19 * 60 + 120);
    expect(result.range).toBe(120);
  });
});
