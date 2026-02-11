/**
 * Test suite for movie utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  toTitleCase,
  aggregateMoviesForDate,
  formatRuntime,
  parseTimeToMins,
  assignOverlapColumns,
  isWeekday,
  isWorkHours,
  getHiddenWorkHoursMovies,
  getWeekdayMovies,
  filterAfterHoursMovies,
  getDayTimeRange,
  WORK_START,
  WORK_END,
} from './movieUtils';
import type { Movie } from './movieUtils';

describe('movieUtils', () => {
  describe('toTitleCase', () => {
    it('should convert basic strings to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    });

    it('should preserve acronyms (all-caps words)', () => {
      expect(toTitleCase('NYC STORIES')).toBe('NYC STORIES');
      expect(toTitleCase('FBI INVESTIGATION')).toBe('FBI INVESTIGATION');
      expect(toTitleCase('USA TODAY')).toBe('USA TODAY');
    });

    it('should preserve roman numerals', () => {
      expect(toTitleCase('part II')).toBe('Part II');
      expect(toTitleCase('chapter III')).toBe('Chapter III');
      expect(toTitleCase('volume IV')).toBe('Volume IV');
      expect(toTitleCase('book X')).toBe('Book X');
      expect(toTitleCase('episode XV')).toBe('Episode XV');
    });

    it('should handle mixed content correctly', () => {
      expect(toTitleCase('NYC part II')).toBe('NYC Part II');
      expect(toTitleCase('the FBI files volume III')).toBe('The FBI Files Volume III');
    });

    it('should handle lowercase roman numerals', () => {
      expect(toTitleCase('part ii')).toBe('Part II');
      expect(toTitleCase('chapter iii')).toBe('Chapter III');
    });

    it('should handle empty strings', () => {
      expect(toTitleCase('')).toBe('');
    });

    it('should handle single words', () => {
      expect(toTitleCase('hello')).toBe('Hello');
      expect(toTitleCase('NYC')).toBe('NYC');
      expect(toTitleCase('II')).toBe('II');
    });
  });

  describe('aggregateMoviesForDate', () => {
    it('should return empty result for empty movie data', () => {
      const result = aggregateMoviesForDate([], '2026-02-11');
      expect(result.targetDate).toBe('');
      expect(result.movies).toEqual([]);
    });

    it('should find movies for exact date match', () => {
      const movies: Movie[] = [
        {
          Movie: 'Test Film',
          Time: '19:00',
          Tickets: 'https://example.com',
          Datetime: '2026-02-11T19:00:00',
          poster_url: '/poster.png',
        },
        {
          Movie: 'Test Film',
          Time: '21:00',
          Tickets: 'https://example.com',
          Datetime: '2026-02-11T21:00:00',
          poster_url: '/poster.png',
        },
      ];

      const result = aggregateMoviesForDate(movies, '2026-02-11');
      expect(result.targetDate).toBe('2026-02-11');
      expect(result.movies).toHaveLength(1);
      expect(result.movies[0].showtimes).toHaveLength(2);
    });

    it('should group movies by title', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '19:00',
          Tickets: 'https://example.com',
          Datetime: '2026-02-11T19:00:00',
          poster_url: '/poster-a.png',
        },
        {
          Movie: 'Film B',
          Time: '20:00',
          Tickets: 'https://example.com',
          Datetime: '2026-02-11T20:00:00',
          poster_url: '/poster-b.png',
        },
        {
          Movie: 'Film A',
          Time: '21:00',
          Tickets: 'https://example.com',
          Datetime: '2026-02-11T21:00:00',
          poster_url: '/poster-a.png',
        },
      ];

      const result = aggregateMoviesForDate(movies, '2026-02-11');
      expect(result.movies).toHaveLength(2);

      const filmA = result.movies.find(m => m.film.Movie === 'Film A');
      expect(filmA?.showtimes).toHaveLength(2);
      expect(filmA?.showtimes.map(s => s.time)).toEqual(['19:00', '21:00']);
    });

    it('should skip movies without poster_url', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '19:00',
          Tickets: 'https://example.com',
          Datetime: '2026-02-11T19:00:00',
          poster_url: '/poster.png',
        },
        {
          Movie: 'Film B',
          Time: '20:00',
          Tickets: 'https://example.com',
          Datetime: '2026-02-11T20:00:00',
        },
      ];

      const result = aggregateMoviesForDate(movies, '2026-02-11');
      expect(result.movies).toHaveLength(1);
      expect(result.movies[0].film.Movie).toBe('Film A');
    });

    it('should wrap to earliest date if no future dates available', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '19:00',
          Tickets: 'https://example.com',
          Datetime: '2026-02-01T19:00:00',
          poster_url: '/poster.png',
        },
      ];

      const result = aggregateMoviesForDate(movies, '2026-02-15');
      expect(result.targetDate).toBe('2026-02-01');
      expect(result.movies).toHaveLength(1);
    });
  });

  describe('formatRuntime', () => {
    it('should format runtime strings', () => {
      expect(formatRuntime('120 minutes')).toBe('120min');
      expect(formatRuntime('90 minutes')).toBe('90min');
    });

    it('should handle undefined runtime', () => {
      expect(formatRuntime(undefined)).toBe('');
    });

    it('should remove spaces', () => {
      expect(formatRuntime('120 minutes')).toBe('120min');
    });
  });

  describe('parseTimeToMins', () => {
    it('should parse PM times correctly', () => {
      expect(parseTimeToMins('1:00')).toBe(13 * 60); // 1:00 PM
      expect(parseTimeToMins('7:30')).toBe(19 * 60 + 30); // 7:30 PM
      expect(parseTimeToMins('11:45')).toBe(23 * 60 + 45); // 11:45 PM
    });

    it('should handle noon correctly', () => {
      expect(parseTimeToMins('12:00')).toBe(12 * 60); // 12:00 PM
      expect(parseTimeToMins('12:30')).toBe(12 * 60 + 30); // 12:30 PM
    });

    it('should handle FF Jr. (morning) shows', () => {
      expect(parseTimeToMins('10:00 FF Jr')).toBe(10 * 60); // 10:00 AM
      expect(parseTimeToMins('11:30 FF Jr')).toBe(11 * 60 + 30); // 11:30 AM
    });

    it('should handle invalid time strings', () => {
      expect(parseTimeToMins('invalid')).toBe(0);
      expect(parseTimeToMins('')).toBe(0);
    });
  });

  describe('assignOverlapColumns', () => {
    it('should assign column 0 to non-overlapping movies', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '1:00',
          Tickets: '',
          Datetime: '2026-02-11T13:00:00',
          runtime: '90',
        },
        {
          Movie: 'Film B',
          Time: '5:00',
          Tickets: '',
          Datetime: '2026-02-11T17:00:00',
          runtime: '90',
        },
      ];

      const result = assignOverlapColumns(movies);
      expect(result[0]._col).toBe(0);
      expect(result[0]._hasOverlap).toBe(false);
      expect(result[1]._col).toBe(0);
      expect(result[1]._hasOverlap).toBe(false);
    });

    it('should assign column 1 to overlapping movies', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '1:00',
          Tickets: '',
          Datetime: '2026-02-11T13:00:00',
          runtime: '120',
        },
        {
          Movie: 'Film B',
          Time: '2:00',
          Tickets: '',
          Datetime: '2026-02-11T14:00:00',
          runtime: '90',
        },
      ];

      const result = assignOverlapColumns(movies);
      expect(result[0]._col).toBe(0);
      expect(result[0]._hasOverlap).toBe(true);
      expect(result[1]._col).toBe(1);
      expect(result[1]._hasOverlap).toBe(true);
    });
  });

  describe('isWeekday', () => {
    it('should identify weekdays correctly', () => {
      expect(isWeekday('2026-02-09')).toBe(true); // Monday
      expect(isWeekday('2026-02-10')).toBe(true); // Tuesday
      expect(isWeekday('2026-02-11')).toBe(true); // Wednesday
      expect(isWeekday('2026-02-12')).toBe(true); // Thursday
      expect(isWeekday('2026-02-13')).toBe(true); // Friday
    });

    it('should identify weekends correctly', () => {
      expect(isWeekday('2026-02-14')).toBe(false); // Saturday
      expect(isWeekday('2026-02-15')).toBe(false); // Sunday
    });
  });

  describe('isWorkHours', () => {
    it('should identify work hours correctly', () => {
      expect(isWorkHours('9:00 FF Jr')).toBe(true); // 9 AM start (FF Jr = morning)
      expect(isWorkHours('10:00 FF Jr')).toBe(true); // 10 AM
      expect(isWorkHours('11:00 FF Jr')).toBe(true); // 11 AM
      expect(isWorkHours('12:00')).toBe(true); // Noon
      expect(isWorkHours('1:00')).toBe(true); // 1 PM
      expect(isWorkHours('4:30')).toBe(true); // 4:30 PM
    });

    it('should identify non-work hours correctly', () => {
      expect(isWorkHours('8:00 FF Jr')).toBe(false); // 8 AM (before work)
      expect(isWorkHours('5:00')).toBe(false); // 5 PM (end of work, not during)
      expect(isWorkHours('7:00')).toBe(false); // 7 PM (after work)
      expect(isWorkHours('9:00')).toBe(false); // 9 PM (evening, no FF Jr means PM)
    });
  });

  describe('getHiddenWorkHoursMovies', () => {
    it('should filter weekday work hours movies', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '12:00',
          Tickets: '',
          Datetime: '2026-02-11T12:00:00',
        },
        {
          Movie: 'Film B',
          Time: '7:00',
          Tickets: '',
          Datetime: '2026-02-11T19:00:00',
        },
        {
          Movie: 'Film C',
          Time: '2:00',
          Tickets: '',
          Datetime: '2026-02-14T14:00:00', // Saturday
        },
      ];

      const result = getHiddenWorkHoursMovies(movies);
      expect(result).toHaveLength(1);
      expect(result[0].Movie).toBe('Film A');
    });
  });

  describe('getWeekdayMovies', () => {
    it('should filter weekday movies', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '7:00',
          Tickets: '',
          Datetime: '2026-02-11T19:00:00', // Wednesday
        },
        {
          Movie: 'Film B',
          Time: '7:00',
          Tickets: '',
          Datetime: '2026-02-14T19:00:00', // Saturday
        },
      ];

      const result = getWeekdayMovies(movies);
      expect(result).toHaveLength(1);
      expect(result[0].Movie).toBe('Film A');
    });
  });

  describe('filterAfterHoursMovies', () => {
    it('should return all movies on weekends', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '12:00',
          Tickets: '',
          Datetime: '2026-02-14T12:00:00',
        },
        {
          Movie: 'Film B',
          Time: '7:00',
          Tickets: '',
          Datetime: '2026-02-14T19:00:00',
        },
      ];

      const result = filterAfterHoursMovies(movies, '2026-02-14');
      expect(result).toHaveLength(2);
    });

    it('should filter work hours on weekdays', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '12:00',
          Tickets: '',
          Datetime: '2026-02-11T12:00:00',
        },
        {
          Movie: 'Film B',
          Time: '7:00',
          Tickets: '',
          Datetime: '2026-02-11T19:00:00',
        },
      ];

      const result = filterAfterHoursMovies(movies, '2026-02-11');
      expect(result).toHaveLength(1);
      expect(result[0].Movie).toBe('Film B');
    });
  });

  describe('getDayTimeRange', () => {
    it('should calculate time range correctly', () => {
      const movies: Movie[] = [
        {
          Movie: 'Film A',
          Time: '1:00',
          Tickets: '',
          Datetime: '2026-02-11T13:00:00',
          runtime: '90',
        },
        {
          Movie: 'Film B',
          Time: '7:00',
          Tickets: '',
          Datetime: '2026-02-11T19:00:00',
          runtime: '120',
        },
      ];

      const result = getDayTimeRange(movies);
      expect(result.start).toBe(13 * 60); // 1 PM
      expect(result.end).toBe(21 * 60); // 9 PM (7 PM + 2 hours)
      expect(result.range).toBe(8 * 60); // 8 hours
    });
  });

  describe('constants', () => {
    it('should define work hours constants correctly', () => {
      expect(WORK_START).toBe(9 * 60); // 9:00 AM
      expect(WORK_END).toBe(17 * 60); // 5:00 PM
    });
  });
});
