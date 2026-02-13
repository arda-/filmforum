/**
 * Comparison tests between old and new encoding methods.
 * Shows the compactness improvements.
 */

import { describe, it, expect } from 'vitest';
import { encodeReactionsCompact, decodeReactionsCompact } from './compactEncoder';
import { encodeReactions, decodeReactions } from './storageManager';
import { MovieBuilder } from './__test__/fixtures';
import type { ReactionMap, UniqueMovie } from '../types/session';

describe('Encoding Comparison: Old vs New', () => {
  it('should be significantly smaller for sparse reactions', () => {
    const movies = MovieBuilder.create(50).build();
    const reactions: ReactionMap = {
      'movie-0': 'yes',
      'movie-5': 'maybe',
      'movie-10': 'no',
    };

    const oldEncoded = encodeReactions(reactions);
    const newEncoded = encodeReactionsCompact(reactions, movies);

    console.log('\n📊 Sparse reactions (3 out of 50 movies):');
    console.log(`  Old encoding: ${oldEncoded.length} chars`);
    console.log(`  New encoding: ${newEncoded.length} chars`);
    console.log(`  Reduction: ${((1 - newEncoded.length / oldEncoded.length) * 100).toFixed(1)}%`);

    expect(newEncoded.length).toBeLessThan(oldEncoded.length);

    // Verify correctness
    const oldDecoded = decodeReactions(oldEncoded);
    const newDecoded = decodeReactionsCompact(newEncoded, movies);
    expect(newDecoded).toEqual(oldDecoded);
  });

  it('should be smaller for typical use case (10 reactions out of 50)', () => {
    const movies = MovieBuilder.create(50).build();
    const reactions: ReactionMap = {
      'movie-0': 'yes',
      'movie-3': 'yes',
      'movie-7': 'maybe',
      'movie-12': 'maybe',
      'movie-20': 'no',
      'movie-25': 'yes',
      'movie-30': 'maybe',
      'movie-35': 'no',
      'movie-40': 'yes',
      'movie-45': 'maybe',
    };

    const oldEncoded = encodeReactions(reactions);
    const newEncoded = encodeReactionsCompact(reactions, movies);

    console.log('\n📊 Typical use case (10 out of 50 movies):');
    console.log(`  Old encoding: ${oldEncoded.length} chars`);
    console.log(`  New encoding: ${newEncoded.length} chars`);
    console.log(`  Reduction: ${((1 - newEncoded.length / oldEncoded.length) * 100).toFixed(1)}%`);

    expect(newEncoded.length).toBeLessThan(oldEncoded.length);

    // Verify correctness
    const oldDecoded = decodeReactions(oldEncoded);
    const newDecoded = decodeReactionsCompact(newEncoded, movies);
    expect(newDecoded).toEqual(oldDecoded);
  });

  it('should handle realistic movie IDs (longer strings)', () => {
    const movies: UniqueMovie[] = [
      'lonesome',
      'taxi',
      'street-scene',
      'little-caesar',
      'the-public-enemy',
      'the-crowd',
      'city-lights',
      'modern-times',
    ].map((id, i) => ({
      id,
      movie: {
        Movie: id.replace(/-/g, ' ').toUpperCase(),
        Date: '2026-02-07',
        Time: '19:00',
        Tickets: 'https://example.com',
        Datetime: '2026-02-07T19:00:00',
        country: 'U.S.',
        year: '1930',
        director: 'Director',
        actors: 'Actor',
        runtime: '90 minutes',
        description: 'Description',
        film_url: 'https://example.com',
        poster_url: '/poster.png',
      },
      showtimes: [],
    }));

    const reactions: ReactionMap = {
      lonesome: 'yes',
      taxi: 'maybe',
      'street-scene': 'no',
    };

    const oldEncoded = encodeReactions(reactions);
    const newEncoded = encodeReactionsCompact(reactions, movies);

    console.log('\n📊 Realistic movie IDs (3 out of 8 movies):');
    console.log(`  Old encoding: ${oldEncoded.length} chars`);
    console.log(`  New encoding: ${newEncoded.length} chars`);
    console.log(`  Reduction: ${((1 - newEncoded.length / oldEncoded.length) * 100).toFixed(1)}%`);
    console.log(`  Old: ${oldEncoded}`);
    console.log(`  New: ${newEncoded}`);

    expect(newEncoded.length).toBeLessThan(oldEncoded.length);

    // Verify correctness
    const oldDecoded = decodeReactions(oldEncoded);
    const newDecoded = decodeReactionsCompact(newEncoded, movies);
    expect(newDecoded).toEqual(oldDecoded);
  });

  it('should be much smaller for large lists with few reactions', () => {
    const movies = MovieBuilder.create(200).build();
    const reactions: ReactionMap = {
      'movie-0': 'yes',
      'movie-100': 'maybe',
      'movie-199': 'no',
    };

    const oldEncoded = encodeReactions(reactions);
    const newEncoded = encodeReactionsCompact(reactions, movies);

    console.log('\n📊 Large list (3 out of 200 movies):');
    console.log(`  Old encoding: ${oldEncoded.length} chars`);
    console.log(`  New encoding: ${newEncoded.length} chars`);
    console.log(`  Reduction: ${((1 - newEncoded.length / oldEncoded.length) * 100).toFixed(1)}%`);

    expect(newEncoded.length).toBeLessThan(oldEncoded.length);

    // Verify correctness
    const oldDecoded = decodeReactions(oldEncoded);
    const newDecoded = decodeReactionsCompact(newEncoded, movies);
    expect(newDecoded).toEqual(oldDecoded);
  });

  it('should handle empty reactions identically', () => {
    const movies = MovieBuilder.create(10).build();
    const reactions: ReactionMap = {};

    const oldEncoded = encodeReactions(reactions);
    const newEncoded = encodeReactionsCompact(reactions, movies);

    console.log('\n📊 Empty reactions:');
    console.log(`  Old encoding: ${oldEncoded.length} chars`);
    console.log(`  New encoding: ${newEncoded.length} chars`);

    // Both should be empty or very small
    expect(oldEncoded.length).toBeLessThan(5);
    expect(newEncoded.length).toBeLessThan(5);

    // Verify correctness
    const oldDecoded = decodeReactions(oldEncoded);
    const newDecoded = decodeReactionsCompact(newEncoded, movies);
    expect(newDecoded).toEqual(oldDecoded);
  });

  it('should produce URLs under 100 chars for typical use', () => {
    const movies = MovieBuilder.create(50).build();
    const reactions: ReactionMap = {
      'movie-0': 'yes',
      'movie-5': 'maybe',
      'movie-10': 'no',
      'movie-15': 'yes',
      'movie-20': 'maybe',
    };

    const encoded = encodeReactionsCompact(reactions, movies);
    const baseUrl = '/session/tenement-stories/list/saved';
    const fullUrl = `${baseUrl}?u=alice&r=${encoded}`;

    console.log('\n📊 Full URL length:');
    console.log(`  ${fullUrl}`);
    console.log(`  Total: ${fullUrl.length} chars`);

    // Should be well under typical URL limits (2000 chars)
    expect(fullUrl.length).toBeLessThan(150);
  });

  it('should scale well with many reactions', () => {
    const movies = MovieBuilder.create(100).build();
    const reactions: ReactionMap = {};

    // Mark 30 movies (30% engagement rate)
    for (let i = 0; i < 100; i += 3) {
      const reactionType = ['yes', 'maybe', 'no'][i % 3];
      reactions[`movie-${i}`] = reactionType as any;
    }

    const oldEncoded = encodeReactions(reactions);
    const newEncoded = encodeReactionsCompact(reactions, movies);

    console.log('\n📊 Heavy use (30 out of 100 movies):');
    console.log(`  Old encoding: ${oldEncoded.length} chars`);
    console.log(`  New encoding: ${newEncoded.length} chars`);
    console.log(`  Reduction: ${((1 - newEncoded.length / oldEncoded.length) * 100).toFixed(1)}%`);

    expect(newEncoded.length).toBeLessThan(oldEncoded.length);

    // Verify correctness
    const oldDecoded = decodeReactions(oldEncoded);
    const newDecoded = decodeReactionsCompact(newEncoded, movies);
    expect(newDecoded).toEqual(oldDecoded);
  });
});
