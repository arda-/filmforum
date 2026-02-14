/**
 * Test suite for compact reaction encoding.
 */

import { describe, it, expect } from 'vitest';
import { encodeReactionsCompact, decodeReactionsCompact } from './compactEncoder';
import type { ReactionMap, UniqueMovie } from '../types/session';

// Mock movie data
function createMockMovies(count: number): UniqueMovie[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `movie-${i}`,
    movie: {
      Movie: `Movie ${i}`,
      Date: '2026-02-07',
      Time: '19:00',
      ticket_url: 'https://example.com',
      Datetime: '2026-02-07T19:00:00',
      film_slug: `movie-${i}`,
      country: 'U.S.',
      year: '2020',
      director: 'Director',
      actors: 'Actor',
      runtime: '90 minutes',
      description: 'Description',
      film_url: 'https://example.com',
      poster_url: '/poster.png',
    },
    showtimes: [],
  }));
}

describe('compactEncoder', () => {
  describe('VarInt encoding/decoding', () => {
    it('should handle small numbers (0-127)', () => {
      const movies = createMockMovies(10);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-5': 'maybe',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should handle large indices (128+)', () => {
      const movies = createMockMovies(200);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-127': 'maybe',
        'movie-150': 'no',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });
  });

  describe('Basic encoding/decoding', () => {
    it('should encode and decode empty reactions', () => {
      const movies = createMockMovies(10);
      const reactions: ReactionMap = {};

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should encode and decode single reaction', () => {
      const movies = createMockMovies(10);
      const reactions: ReactionMap = {
        'movie-5': 'yes',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should encode and decode multiple reactions', () => {
      const movies = createMockMovies(20);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-5': 'maybe',
        'movie-10': 'no',
        'movie-15': 'yes',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should only encode non-none reactions', () => {
      const movies = createMockMovies(10);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-1': 'none',
        'movie-2': 'maybe',
        'movie-3': 'none',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      // 'none' reactions should not be in output
      expect(decoded).toEqual({
        'movie-0': 'yes',
        'movie-2': 'maybe',
      });
    });
  });

  describe('All reaction types', () => {
    it('should handle yes reactions', () => {
      const movies = createMockMovies(5);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-1': 'yes',
        'movie-2': 'yes',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should handle maybe reactions', () => {
      const movies = createMockMovies(5);
      const reactions: ReactionMap = {
        'movie-0': 'maybe',
        'movie-1': 'maybe',
        'movie-2': 'maybe',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should handle no reactions', () => {
      const movies = createMockMovies(5);
      const reactions: ReactionMap = {
        'movie-0': 'no',
        'movie-1': 'no',
        'movie-2': 'no',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should handle mixed reactions', () => {
      const movies = createMockMovies(10);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-1': 'maybe',
        'movie-2': 'no',
        'movie-3': 'yes',
        'movie-4': 'maybe',
        'movie-5': 'no',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });
  });

  describe('Edge cases', () => {
    it('should handle reaction at index 0', () => {
      const movies = createMockMovies(10);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should handle reaction at last index', () => {
      const movies = createMockMovies(10);
      const reactions: ReactionMap = {
        'movie-9': 'yes',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should handle all movies with reactions', () => {
      const movies = createMockMovies(5);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-1': 'maybe',
        'movie-2': 'no',
        'movie-3': 'yes',
        'movie-4': 'maybe',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should handle invalid encoded data gracefully', () => {
      const movies = createMockMovies(10);
      const decoded = decodeReactionsCompact('invalid!!!', movies);

      expect(decoded).toEqual({});
    });

    it('should handle empty string gracefully', () => {
      const movies = createMockMovies(10);
      const decoded = decodeReactionsCompact('', movies);

      expect(decoded).toEqual({});
    });
  });

  describe('Compactness', () => {
    it('should be more compact than naive base64 encoding', () => {
      const movies = createMockMovies(50);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-5': 'maybe',
        'movie-10': 'no',
      };

      // Naive encoding: "movie-0:yes,movie-5:maybe,movie-10:no"
      const naive = btoa('movie-0:yes,movie-5:maybe,movie-10:no');
      const compact = encodeReactionsCompact(reactions, movies);

      expect(compact.length).toBeLessThan(naive.length);
    });

    it('should produce short URLs for typical use case', () => {
      const movies = createMockMovies(50);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-3': 'yes',
        'movie-7': 'maybe',
        'movie-12': 'maybe',
        'movie-20': 'no',
      };

      const encoded = encodeReactionsCompact(reactions, movies);

      // Should be under 20 chars for 5 reactions out of 50 movies
      expect(encoded.length).toBeLessThan(20);
    });
  });

  describe('Reproducibility', () => {
    it('should produce same encoding for same input', () => {
      const movies = createMockMovies(10);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-5': 'maybe',
      };

      const encoded1 = encodeReactionsCompact(reactions, movies);
      const encoded2 = encodeReactionsCompact(reactions, movies);

      expect(encoded1).toBe(encoded2);
    });

    it('should be deterministic across multiple encode/decode cycles', () => {
      const movies = createMockMovies(20);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-5': 'maybe',
        'movie-10': 'no',
        'movie-15': 'yes',
      };

      let current = reactions;
      for (let i = 0; i < 10; i++) {
        const encoded = encodeReactionsCompact(current, movies);
        current = decodeReactionsCompact(encoded, movies);
      }

      expect(current).toEqual(reactions);
    });
  });

  describe('Stress test', () => {
    it('should handle large movie lists', () => {
      const movies = createMockMovies(1000);
      const reactions: ReactionMap = {};

      // Mark every 10th movie
      for (let i = 0; i < 1000; i += 10) {
        reactions[`movie-${i}`] = ['yes', 'maybe', 'no'][i % 3] as any;
      }

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });

    it('should handle sparse reactions (few reactions, many movies)', () => {
      const movies = createMockMovies(500);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-250': 'maybe',
        'movie-499': 'no',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);

      // Should still be very compact
      expect(encoded.length).toBeLessThan(30);
    });

    it('should handle dense reactions (many reactions, few movies)', () => {
      const movies = createMockMovies(10);
      const reactions: ReactionMap = {
        'movie-0': 'yes',
        'movie-1': 'maybe',
        'movie-2': 'no',
        'movie-3': 'yes',
        'movie-4': 'maybe',
        'movie-5': 'no',
        'movie-6': 'yes',
        'movie-7': 'maybe',
        'movie-8': 'no',
        'movie-9': 'yes',
      };

      const encoded = encodeReactionsCompact(reactions, movies);
      const decoded = decodeReactionsCompact(encoded, movies);

      expect(decoded).toEqual(reactions);
    });
  });
});
