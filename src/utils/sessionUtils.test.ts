/**
 * Test suite for session utility functions.
 * Covers: movieId, deduplicateMovies, sortMovies, getDecade,
 * extractFilterOptions, matchesFilter.
 */

import { describe, it, expect } from 'vitest';
import {
  movieId,
  deduplicateMovies,
  sortMovies,
  getDecade,
  extractFilterOptions,
  matchesFilter,
} from './sessionUtils';
import type { UniqueMovie } from '../types/session';
import type { Movie } from './movieUtils';

describe('sessionUtils', () => {
  // --- Helpers ---

  function makeMovie(overrides: Partial<Movie> & { Movie: string }): Movie {
    return {
      Time: '7:00',
      Tickets: 'https://example.com',
      Datetime: '2026-02-11T19:00:00',
      ...overrides,
    };
  }

  function makeUniqueMovie(
    overrides: Partial<Movie> & { Movie: string }
  ): UniqueMovie {
    const movie = makeMovie(overrides);
    return {
      id: movieId(movie.Movie),
      movie,
      showtimes: [{ datetime: movie.Datetime, time: movie.Time, tickets: movie.Tickets }],
    };
  }

  // --- movieId ---

  describe('movieId', () => {
    it('should normalize to lowercase with hyphens', () => {
      expect(movieId('TAXI!')).toBe('taxi');
      expect(movieId('Mean Streets')).toBe('mean-streets');
      expect(movieId('West Side Story')).toBe('west-side-story');
    });

    it('should strip leading and trailing hyphens', () => {
      expect(movieId('!Hello!')).toBe('hello');
      expect(movieId('---test---')).toBe('test');
    });

    it('should collapse multiple non-alphanumeric chars into single hyphen', () => {
      expect(movieId('A -- B')).toBe('a-b');
      expect(movieId('Film (1932)')).toBe('film-1932');
    });

    it('should handle empty string', () => {
      expect(movieId('')).toBe('');
    });

    it('should preserve numbers', () => {
      expect(movieId('2001: A Space Odyssey')).toBe('2001-a-space-odyssey');
    });
  });

  // --- deduplicateMovies ---

  describe('deduplicateMovies', () => {
    it('should group showtimes for the same movie', () => {
      const movies: Movie[] = [
        makeMovie({ Movie: 'TAXI!', Time: '2:10', Datetime: '2026-02-06T14:10:00' }),
        makeMovie({ Movie: 'TAXI!', Time: '7:30', Datetime: '2026-02-06T19:30:00' }),
      ];

      const result = deduplicateMovies(movies);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('taxi');
      expect(result[0].showtimes).toHaveLength(2);
      expect(result[0].showtimes[0].time).toBe('2:10');
      expect(result[0].showtimes[1].time).toBe('7:30');
    });

    it('should keep different movies separate', () => {
      const movies: Movie[] = [
        makeMovie({ Movie: 'TAXI!', Time: '2:10' }),
        makeMovie({ Movie: 'Mean Streets', Time: '7:00' }),
      ];

      const result = deduplicateMovies(movies);
      expect(result).toHaveLength(2);
    });

    it('should return empty array for empty input', () => {
      expect(deduplicateMovies([])).toEqual([]);
    });

    it('should use the first occurrence as the base movie data', () => {
      const movies: Movie[] = [
        makeMovie({ Movie: 'TAXI!', director: 'Roy Del Ruth', Time: '2:10' }),
        makeMovie({ Movie: 'TAXI!', director: 'Roy Del Ruth', Time: '7:30' }),
      ];

      const result = deduplicateMovies(movies);
      expect(result[0].movie.director).toBe('Roy Del Ruth');
    });

    it('should handle a single movie entry', () => {
      const movies: Movie[] = [
        makeMovie({ Movie: 'Lonesome' }),
      ];

      const result = deduplicateMovies(movies);
      expect(result).toHaveLength(1);
      expect(result[0].showtimes).toHaveLength(1);
    });
  });

  // --- sortMovies ---

  describe('sortMovies', () => {
    const taxi = makeUniqueMovie({ Movie: 'TAXI!', year: '1932', director: 'Roy Del Ruth' });
    const crowd = makeUniqueMovie({ Movie: 'The Crowd', year: '1928', director: 'King Vidor' });
    const meanStreets = makeUniqueMovie({ Movie: 'Mean Streets', year: '1973', director: 'Martin Scorsese' });

    describe('alpha sort', () => {
      it('should sort alphabetically ignoring leading articles', () => {
        const sorted = sortMovies([taxi, crowd, meanStreets], 'alpha');
        // "The Crowd" sorts as "Crowd", so: Crowd, Mean Streets, TAXI!
        expect(sorted.map(m => m.movie.Movie)).toEqual([
          'The Crowd', 'Mean Streets', 'TAXI!'
        ]);
      });

      it('should handle "A" and "An" articles', () => {
        const aFilm = makeUniqueMovie({ Movie: 'A Raisin in the Sun' });
        const anFilm = makeUniqueMovie({ Movie: 'An Example Film' });
        const sorted = sortMovies([anFilm, aFilm], 'alpha');
        // "A Raisin..." sorts as "Raisin...", "An Example..." sorts as "Example..."
        expect(sorted.map(m => m.movie.Movie)).toEqual([
          'An Example Film', 'A Raisin in the Sun'
        ]);
      });
    });

    describe('year sort', () => {
      it('should sort by release year ascending', () => {
        const sorted = sortMovies([meanStreets, taxi, crowd], 'year');
        expect(sorted.map(m => m.movie.year)).toEqual(['1928', '1932', '1973']);
      });

      it('should treat missing year as 0', () => {
        const noYear = makeUniqueMovie({ Movie: 'Unknown' });
        const sorted = sortMovies([taxi, noYear], 'year');
        expect(sorted[0].movie.Movie).toBe('Unknown');
      });
    });

    describe('director sort', () => {
      it('should sort by director name alphabetically', () => {
        const sorted = sortMovies([taxi, crowd, meanStreets], 'director');
        expect(sorted.map(m => m.movie.director)).toEqual([
          'King Vidor', 'Martin Scorsese', 'Roy Del Ruth'
        ]);
      });

      it('should treat missing director as empty string', () => {
        const noDirector = makeUniqueMovie({ Movie: 'Unknown' });
        const sorted = sortMovies([taxi, noDirector], 'director');
        expect(sorted[0].movie.Movie).toBe('Unknown');
      });
    });

    describe('marked sort', () => {
      it('should sort by reaction: yes > maybe > no > none', () => {
        const a = makeUniqueMovie({ Movie: 'A' });
        const b = makeUniqueMovie({ Movie: 'B' });
        const c = makeUniqueMovie({ Movie: 'C' });
        const d = makeUniqueMovie({ Movie: 'D' });

        const reactions = { [a.id]: 'no', [b.id]: 'yes', [c.id]: 'maybe' };
        const sorted = sortMovies([a, b, c, d], 'marked', reactions);
        expect(sorted.map(m => m.movie.Movie)).toEqual(['B', 'C', 'A', 'D']);
      });

      it('should preserve order when no reactions provided', () => {
        const a = makeUniqueMovie({ Movie: 'A' });
        const b = makeUniqueMovie({ Movie: 'B' });
        const sorted = sortMovies([a, b], 'marked');
        expect(sorted.map(m => m.movie.Movie)).toEqual(['A', 'B']);
      });
    });

    describe('unknown sort', () => {
      it('should return movies in original order for unknown sort key', () => {
        const sorted = sortMovies([meanStreets, taxi], 'unknown');
        expect(sorted.map(m => m.movie.Movie)).toEqual(['Mean Streets', 'TAXI!']);
      });
    });

    it('should not mutate the original array', () => {
      const original = [taxi, crowd];
      const sorted = sortMovies(original, 'year');
      expect(original[0].movie.Movie).toBe('TAXI!');
      expect(sorted[0].movie.Movie).toBe('The Crowd');
    });
  });

  // --- getDecade ---

  describe('getDecade', () => {
    it('should convert year to decade label', () => {
      expect(getDecade('1932')).toBe('1930s');
      expect(getDecade('1928')).toBe('1920s');
      expect(getDecade('1973')).toBe('1970s');
      expect(getDecade('2004')).toBe('2000s');
    });

    it('should handle boundary years', () => {
      expect(getDecade('1930')).toBe('1930s');
      expect(getDecade('1939')).toBe('1930s');
      expect(getDecade('1940')).toBe('1940s');
      expect(getDecade('2000')).toBe('2000s');
    });

    it('should return empty string for invalid year', () => {
      expect(getDecade('')).toBe('');
      expect(getDecade('abc')).toBe('');
      expect(getDecade('not-a-year')).toBe('');
    });

    it('should handle undefined-like values', () => {
      expect(getDecade('')).toBe('');
    });
  });

  // --- extractFilterOptions ---

  describe('extractFilterOptions', () => {
    it('should extract unique directors sorted alphabetically', () => {
      const movies = [
        makeUniqueMovie({ Movie: 'A', director: 'Martin Scorsese' }),
        makeUniqueMovie({ Movie: 'B', director: 'King Vidor' }),
        makeUniqueMovie({ Movie: 'C', director: 'Martin Scorsese' }),
      ];

      const opts = extractFilterOptions(movies);
      expect(opts.directors).toEqual(['King Vidor', 'Martin Scorsese']);
    });

    it('should extract unique actors sorted alphabetically', () => {
      const movies = [
        makeUniqueMovie({ Movie: 'A', actors: 'Al Pacino, Robert De Niro' }),
        makeUniqueMovie({ Movie: 'B', actors: 'Robert De Niro, Joe Pesci' }),
      ];

      const opts = extractFilterOptions(movies);
      expect(opts.actors).toEqual(['Al Pacino', 'Joe Pesci', 'Robert De Niro']);
    });

    it('should extract unique decades sorted', () => {
      const movies = [
        makeUniqueMovie({ Movie: 'A', year: '1932' }),
        makeUniqueMovie({ Movie: 'B', year: '1928' }),
        makeUniqueMovie({ Movie: 'C', year: '1973' }),
        makeUniqueMovie({ Movie: 'D', year: '1935' }),
      ];

      const opts = extractFilterOptions(movies);
      expect(opts.decades).toEqual(['1920s', '1930s', '1970s']);
    });

    it('should handle movies with missing fields', () => {
      const movies = [
        makeUniqueMovie({ Movie: 'A' }), // no director, actors, year
        makeUniqueMovie({ Movie: 'B', director: 'Someone', actors: 'Actor One', year: '1950' }),
      ];

      const opts = extractFilterOptions(movies);
      expect(opts.directors).toEqual(['Someone']);
      expect(opts.actors).toEqual(['Actor One']);
      expect(opts.decades).toEqual(['1950s']);
    });

    it('should return empty arrays for empty input', () => {
      const opts = extractFilterOptions([]);
      expect(opts.directors).toEqual([]);
      expect(opts.actors).toEqual([]);
      expect(opts.decades).toEqual([]);
    });

    it('should handle actors with extra whitespace', () => {
      const movies = [
        makeUniqueMovie({ Movie: 'A', actors: ' Al Pacino , Robert De Niro ' }),
      ];

      const opts = extractFilterOptions(movies);
      expect(opts.actors).toEqual(['Al Pacino', 'Robert De Niro']);
    });

    it('should skip empty actor entries from trailing commas', () => {
      const movies = [
        makeUniqueMovie({ Movie: 'A', actors: 'Al Pacino, ' }),
      ];

      const opts = extractFilterOptions(movies);
      expect(opts.actors).toEqual(['Al Pacino']);
    });
  });

  // --- matchesFilter ---

  describe('matchesFilter', () => {
    // Helper for creating a filter-ready movie object (lowercase values)
    function filterMovie(m: { title: string; director?: string; actors?: string; year?: string }) {
      return {
        title: m.title.toLowerCase(),
        director: (m.director || '').toLowerCase(),
        actors: (m.actors || '').toLowerCase(),
        year: m.year || '',
      };
    }

    const noFilters: () => { query: string; director: string; actor: string; decades: string[] } =
      () => ({ query: '', director: '', actor: '', decades: [] });

    const taxi = filterMovie({
      title: 'TAXI!',
      director: 'Roy Del Ruth',
      actors: 'James Cagney, Loretta Young',
      year: '1932',
    });

    const meanStreets = filterMovie({
      title: 'Mean Streets',
      director: 'Martin Scorsese',
      actors: 'Robert De Niro, Harvey Keitel',
      year: '1973',
    });

    const crowd = filterMovie({
      title: 'The Crowd',
      director: 'King Vidor',
      actors: 'James Murray, Eleanor Boardman',
      year: '1928',
    });

    describe('no filters', () => {
      it('should match all movies when no filters are set', () => {
        expect(matchesFilter(taxi, noFilters())).toBe(true);
        expect(matchesFilter(meanStreets, noFilters())).toBe(true);
      });
    });

    describe('text search', () => {
      it('should match by title', () => {
        expect(matchesFilter(taxi, { ...noFilters(), query: 'taxi' })).toBe(true);
        expect(matchesFilter(taxi, { ...noFilters(), query: 'mean' })).toBe(false);
      });

      it('should match by director name', () => {
        expect(matchesFilter(taxi, { ...noFilters(), query: 'roy' })).toBe(true);
        expect(matchesFilter(taxi, { ...noFilters(), query: 'del ruth' })).toBe(true);
      });

      it('should match by actor name', () => {
        expect(matchesFilter(taxi, { ...noFilters(), query: 'cagney' })).toBe(true);
        expect(matchesFilter(taxi, { ...noFilters(), query: 'loretta' })).toBe(true);
      });

      it('should be case-insensitive', () => {
        expect(matchesFilter(taxi, { ...noFilters(), query: 'TAXI' })).toBe(true);
        expect(matchesFilter(taxi, { ...noFilters(), query: 'Cagney' })).toBe(true);
      });

      it('should not match unrelated queries', () => {
        expect(matchesFilter(taxi, { ...noFilters(), query: 'scorsese' })).toBe(false);
      });

      it('should match partial words', () => {
        expect(matchesFilter(taxi, { ...noFilters(), query: 'tax' })).toBe(true);
        expect(matchesFilter(meanStreets, { ...noFilters(), query: 'stre' })).toBe(true);
      });
    });

    describe('director filter', () => {
      it('should match exact director (case-insensitive)', () => {
        expect(matchesFilter(taxi, { ...noFilters(), director: 'Roy Del Ruth' })).toBe(true);
        expect(matchesFilter(taxi, { ...noFilters(), director: 'roy del ruth' })).toBe(true);
      });

      it('should not match partial director names', () => {
        expect(matchesFilter(taxi, { ...noFilters(), director: 'Roy' })).toBe(false);
        expect(matchesFilter(taxi, { ...noFilters(), director: 'Del Ruth' })).toBe(false);
      });

      it('should not match wrong director', () => {
        expect(matchesFilter(taxi, { ...noFilters(), director: 'King Vidor' })).toBe(false);
      });
    });

    describe('actor filter', () => {
      it('should match an actor in the list', () => {
        expect(matchesFilter(taxi, { ...noFilters(), actor: 'James Cagney' })).toBe(true);
        expect(matchesFilter(taxi, { ...noFilters(), actor: 'Loretta Young' })).toBe(true);
      });

      it('should not match partial actor names (whole-name matching)', () => {
        // "James" alone should NOT match — it's not a full actor name in the list
        expect(matchesFilter(taxi, { ...noFilters(), actor: 'James' })).toBe(false);
      });

      it('should not match actors from other movies', () => {
        expect(matchesFilter(taxi, { ...noFilters(), actor: 'Robert De Niro' })).toBe(false);
      });

      it('should handle "James" not matching "James Murray" in a different movie', () => {
        // "James Cagney" is in taxi, "James Murray" is in crowd
        // Filtering by "James Cagney" should only match taxi
        expect(matchesFilter(taxi, { ...noFilters(), actor: 'James Cagney' })).toBe(true);
        expect(matchesFilter(crowd, { ...noFilters(), actor: 'James Cagney' })).toBe(false);
      });

      it('should be case-insensitive', () => {
        expect(matchesFilter(taxi, { ...noFilters(), actor: 'james cagney' })).toBe(true);
        expect(matchesFilter(taxi, { ...noFilters(), actor: 'JAMES CAGNEY' })).toBe(true);
      });
    });

    describe('decade filter', () => {
      it('should match movies from the correct decade', () => {
        expect(matchesFilter(taxi, { ...noFilters(), decades: ['1930s'] })).toBe(true);
        expect(matchesFilter(crowd, { ...noFilters(), decades: ['1920s'] })).toBe(true);
        expect(matchesFilter(meanStreets, { ...noFilters(), decades: ['1970s'] })).toBe(true);
      });

      it('should not match movies from other decades', () => {
        expect(matchesFilter(taxi, { ...noFilters(), decades: ['1920s'] })).toBe(false);
        expect(matchesFilter(taxi, { ...noFilters(), decades: ['1970s'] })).toBe(false);
      });

      it('should match movies from any of the selected decades (multi-select)', () => {
        expect(matchesFilter(taxi, { ...noFilters(), decades: ['1920s', '1930s'] })).toBe(true);
        expect(matchesFilter(crowd, { ...noFilters(), decades: ['1920s', '1930s'] })).toBe(true);
        expect(matchesFilter(meanStreets, { ...noFilters(), decades: ['1920s', '1930s'] })).toBe(false);
      });
    });

    describe('combined filters (AND logic)', () => {
      it('should require all filters to match', () => {
        // Director + decade that both match
        expect(matchesFilter(taxi, {
          query: '', director: 'Roy Del Ruth', actor: '', decades: ['1930s'],
        })).toBe(true);

        // Director matches but decade doesn't
        expect(matchesFilter(taxi, {
          query: '', director: 'Roy Del Ruth', actor: '', decades: ['1920s'],
        })).toBe(false);
      });

      it('should combine text search with dropdown filters', () => {
        // Search matches + director matches
        expect(matchesFilter(taxi, {
          query: 'cagney', director: 'Roy Del Ruth', actor: '', decades: [],
        })).toBe(true);

        // Search matches but director doesn't
        expect(matchesFilter(taxi, {
          query: 'taxi', director: 'King Vidor', actor: '', decades: [],
        })).toBe(false);
      });

      it('should combine all four filters', () => {
        expect(matchesFilter(taxi, {
          query: 'taxi', director: 'Roy Del Ruth', actor: 'James Cagney', decades: ['1930s'],
        })).toBe(true);

        // One filter wrong
        expect(matchesFilter(taxi, {
          query: 'taxi', director: 'Roy Del Ruth', actor: 'Robert De Niro', decades: ['1930s'],
        })).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle movie with no director', () => {
        const noDir = filterMovie({ title: 'Unknown Film', year: '1950' });
        expect(matchesFilter(noDir, { ...noFilters(), director: 'Anyone' })).toBe(false);
        expect(matchesFilter(noDir, noFilters())).toBe(true);
      });

      it('should handle movie with no actors', () => {
        const noActors = filterMovie({ title: 'Unknown Film', director: 'Someone', year: '1950' });
        expect(matchesFilter(noActors, { ...noFilters(), actor: 'Anyone' })).toBe(false);
        expect(matchesFilter(noActors, noFilters())).toBe(true);
      });

      it('should handle movie with no year', () => {
        const noYear = filterMovie({ title: 'Unknown Film', director: 'Someone' });
        expect(matchesFilter(noYear, { ...noFilters(), decades: ['1950s'] })).toBe(false);
        expect(matchesFilter(noYear, noFilters())).toBe(true);
      });

      it('should handle empty search query (treated as no filter)', () => {
        expect(matchesFilter(taxi, { ...noFilters(), query: '' })).toBe(true);
        expect(matchesFilter(taxi, { ...noFilters(), query: '   ' })).toBe(true);
      });
    });
  });
});
