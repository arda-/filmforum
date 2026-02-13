/**
 * Test suite for list comparison categorization logic.
 */

import { describe, it, expect } from 'vitest';
import { categorizeMovies, type Category } from './listComparison';
import { MovieBuilder, ReactionBuilder } from './__test__/fixtures';
import { ALL_PRESETS } from './__test__/comparePresets';
import type { ReactionMap } from '../types/session';

describe('listComparison', () => {
  describe('Basic categorization rules', () => {
    it('should categorize both-yes as strong', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).yes(0).build();
      const listB = ReactionBuilder.for(movies).yes(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('strong');
      expect(result[0].reactionA).toBe('yes');
      expect(result[0].reactionB).toBe('yes');
    });

    it('should categorize both-maybe as possible', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).maybe(0).build();
      const listB = ReactionBuilder.for(movies).maybe(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('possible');
      expect(result[0].reactionA).toBe('maybe');
      expect(result[0].reactionB).toBe('maybe');
    });

    it('should categorize yes+maybe as possible', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).yes(0).build();
      const listB = ReactionBuilder.for(movies).maybe(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('possible');
      expect(result[0].reactionA).toBe('yes');
      expect(result[0].reactionB).toBe('maybe');
    });

    it('should categorize maybe+yes as possible', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).maybe(0).build();
      const listB = ReactionBuilder.for(movies).yes(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('possible');
      expect(result[0].reactionA).toBe('maybe');
      expect(result[0].reactionB).toBe('yes');
    });

    it('should categorize both-no as pass', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).no(0).build();
      const listB = ReactionBuilder.for(movies).no(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('pass');
      expect(result[0].reactionA).toBe('no');
      expect(result[0].reactionB).toBe('no');
    });

    it('should categorize yes+no as disagree', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).yes(0).build();
      const listB = ReactionBuilder.for(movies).no(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('disagree');
      expect(result[0].reactionA).toBe('yes');
      expect(result[0].reactionB).toBe('no');
    });

    it('should categorize no+yes as disagree', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).no(0).build();
      const listB = ReactionBuilder.for(movies).yes(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('disagree');
      expect(result[0].reactionA).toBe('no');
      expect(result[0].reactionB).toBe('yes');
    });

    it('should categorize maybe+no as disagree', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).maybe(0).build();
      const listB = ReactionBuilder.for(movies).no(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('disagree');
      expect(result[0].reactionA).toBe('maybe');
      expect(result[0].reactionB).toBe('no');
    });

    it('should categorize no+maybe as disagree', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).no(0).build();
      const listB = ReactionBuilder.for(movies).maybe(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('disagree');
      expect(result[0].reactionA).toBe('no');
      expect(result[0].reactionB).toBe('maybe');
    });

    it('should categorize none+any as unreviewed', () => {
      const movies = MovieBuilder.create(3).build();
      const listA: ReactionMap = {}; // Empty (none)
      const listB = ReactionBuilder.for(movies).yes(0).maybe(1).no(2).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('unreviewed');
      expect(result[1].category).toBe('unreviewed');
      expect(result[2].category).toBe('unreviewed');
      expect(result[0].reactionA).toBe('none');
      expect(result[1].reactionA).toBe('none');
      expect(result[2].reactionA).toBe('none');
    });

    it('should categorize any+none as unreviewed', () => {
      const movies = MovieBuilder.create(3).build();
      const listA = ReactionBuilder.for(movies).yes(0).maybe(1).no(2).build();
      const listB: ReactionMap = {}; // Empty (none)

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0].category).toBe('unreviewed');
      expect(result[1].category).toBe('unreviewed');
      expect(result[2].category).toBe('unreviewed');
      expect(result[0].reactionB).toBe('none');
      expect(result[1].reactionB).toBe('none');
      expect(result[2].reactionB).toBe('none');
    });
  });

  describe('Preset scenarios', () => {
    ALL_PRESETS.forEach(preset => {
      it(`should correctly categorize: ${preset.name}`, () => {
        const result = categorizeMovies(preset.movies, preset.listA, preset.listB);

        // Count items in each category
        const counts: Record<Category, number> = {
          strong: 0,
          possible: 0,
          disagree: 0,
          pass: 0,
          unreviewed: 0,
        };

        result.forEach(item => {
          counts[item.category]++;
        });

        expect(counts).toEqual(preset.expected);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty movie list', () => {
      const movies = MovieBuilder.create(0).build();
      const listA: ReactionMap = {};
      const listB: ReactionMap = {};

      const result = categorizeMovies(movies, listA, listB);

      expect(result).toEqual([]);
    });

    it('should handle movies not in either reaction map', () => {
      const movies = MovieBuilder.create(3).build();
      const listA: ReactionMap = {}; // No reactions
      const listB: ReactionMap = {}; // No reactions

      const result = categorizeMovies(movies, listA, listB);

      expect(result).toHaveLength(3);
      expect(result.every(item => item.category === 'unreviewed')).toBe(true);
      expect(result.every(item => item.reactionA === 'none' && item.reactionB === 'none')).toBe(true);
    });

    it('should handle single movie', () => {
      const movies = MovieBuilder.create(1).build();
      const listA = ReactionBuilder.for(movies).yes(0).build();
      const listB = ReactionBuilder.for(movies).no(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('disagree');
    });

    it('should handle all movies in one category (all strong)', () => {
      const movies = MovieBuilder.create(5).build();
      const listA = ReactionBuilder.for(movies).all('yes').build();
      const listB = ReactionBuilder.for(movies).all('yes').build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result).toHaveLength(5);
      expect(result.every(item => item.category === 'strong')).toBe(true);
    });

    it('should handle all movies in one category (all pass)', () => {
      const movies = MovieBuilder.create(5).build();
      const listA = ReactionBuilder.for(movies).all('no').build();
      const listB = ReactionBuilder.for(movies).all('no').build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result).toHaveLength(5);
      expect(result.every(item => item.category === 'pass')).toBe(true);
    });
  });

  describe('Return value structure', () => {
    it('should return correct CompareItem structure', () => {
      const movies = MovieBuilder.create(2).build();
      const listA = ReactionBuilder.for(movies).yes(0).build();
      const listB = ReactionBuilder.for(movies).maybe(0).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result[0]).toHaveProperty('movie');
      expect(result[0]).toHaveProperty('reactionA');
      expect(result[0]).toHaveProperty('reactionB');
      expect(result[0]).toHaveProperty('category');
      expect(result[0].movie).toBe(movies[0]);
      expect(result[0].reactionA).toBe('yes');
      expect(result[0].reactionB).toBe('maybe');
      expect(result[0].category).toBe('possible');
    });

    it('should preserve movie order from input', () => {
      const movies = MovieBuilder.create(5).build();
      const listA = ReactionBuilder.for(movies).yes(0, 2, 4).build();
      const listB = ReactionBuilder.for(movies).yes(1, 3).build();

      const result = categorizeMovies(movies, listA, listB);

      expect(result).toHaveLength(5);
      expect(result[0].movie.id).toBe('movie-0');
      expect(result[1].movie.id).toBe('movie-1');
      expect(result[2].movie.id).toBe('movie-2');
      expect(result[3].movie.id).toBe('movie-3');
      expect(result[4].movie.id).toBe('movie-4');
    });
  });
});
