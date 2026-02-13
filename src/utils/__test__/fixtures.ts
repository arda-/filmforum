/**
 * Shared test fixture builders for creating movies and reactions.
 * Replaces duplicated `createMockMovies` functions across test files.
 */

import type { UniqueMovie, MovieReaction, ReactionMap } from '../../types/session';

/** Chainable builder for creating mock movies */
export class MovieBuilder {
  private movies: UniqueMovie[] = [];
  private useRealisticData = false;

  private constructor(count: number) {
    this.movies = Array.from({ length: count }, (_, i) => ({
      id: `movie-${i}`,
      movie: {
        Movie: `Movie ${i}`,
        Date: '2026-02-07',
        Time: '19:00',
        Tickets: 'https://example.com',
        Datetime: '2026-02-07T19:00:00',
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

  /**
   * Create a builder with N movies.
   * @param count Number of movies to create
   */
  static create(count: number): MovieBuilder {
    return new MovieBuilder(count);
  }

  /**
   * Use specific IDs instead of auto-generated `movie-0`, `movie-1`, etc.
   * @param ids Array of movie IDs (must match the count)
   */
  withIds(ids: string[]): this {
    if (ids.length !== this.movies.length) {
      throw new Error(`Expected ${this.movies.length} IDs, got ${ids.length}`);
    }
    this.movies.forEach((m, i) => {
      m.id = ids[i];
    });
    return this;
  }

  /**
   * Fill in varied directors, years, runtimes instead of generic values.
   * Uses deterministic patterns for reproducibility.
   */
  withRealisticData(): this {
    this.useRealisticData = true;
    const directors = ['Spielberg', 'Scorsese', 'Tarantino', 'Nolan', 'Kubrick', 'Anderson', 'Fincher'];
    const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026'];
    const runtimes = ['90 minutes', '105 minutes', '120 minutes', '135 minutes', '150 minutes'];

    this.movies.forEach((m, i) => {
      m.movie.director = directors[i % directors.length];
      m.movie.year = years[i % years.length];
      m.movie.runtime = runtimes[i % runtimes.length];
      m.movie.Movie = `Film ${i + 1} by ${directors[i % directors.length]}`;
    });

    return this;
  }

  /**
   * Build the final array of UniqueMovie objects.
   */
  build(): UniqueMovie[] {
    return this.movies;
  }
}

/** Chainable builder for creating reaction maps */
export class ReactionBuilder {
  private reactions: ReactionMap = {};

  private constructor(private movies: UniqueMovie[]) {}

  /**
   * Create a reaction builder for a list of movies.
   * @param movies The movies to create reactions for
   */
  static for(movies: UniqueMovie[]): ReactionBuilder {
    return new ReactionBuilder(movies);
  }

  /**
   * Set movies at specified indices to 'yes'.
   * @param indices Array of movie indices (0-based)
   */
  yes(...indices: number[]): this {
    indices.forEach(i => {
      if (i >= 0 && i < this.movies.length) {
        this.reactions[this.movies[i].id] = 'yes';
      }
    });
    return this;
  }

  /**
   * Set movies at specified indices to 'maybe'.
   * @param indices Array of movie indices (0-based)
   */
  maybe(...indices: number[]): this {
    indices.forEach(i => {
      if (i >= 0 && i < this.movies.length) {
        this.reactions[this.movies[i].id] = 'maybe';
      }
    });
    return this;
  }

  /**
   * Set movies at specified indices to 'no'.
   * @param indices Array of movie indices (0-based)
   */
  no(...indices: number[]): this {
    indices.forEach(i => {
      if (i >= 0 && i < this.movies.length) {
        this.reactions[this.movies[i].id] = 'no';
      }
    });
    return this;
  }

  /**
   * Set all movies to the same reaction.
   * @param reaction The reaction to apply to all movies
   */
  all(reaction: Exclude<MovieReaction, 'none'>): this {
    this.movies.forEach(m => {
      this.reactions[m.id] = reaction;
    });
    return this;
  }

  /**
   * Generate random reactions with a deterministic seed.
   * @param seed Optional seed for reproducibility (default: 42)
   */
  random(seed: number = 42): this {
    // Simple seeded PRNG (Mulberry32)
    let state = seed;
    const rand = () => {
      state |= 0;
      state = (state + 0x6D2B79F5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };

    const reactions: MovieReaction[] = ['yes', 'maybe', 'no'];
    this.movies.forEach(m => {
      // 70% chance of having a reaction, 30% chance of none
      if (rand() < 0.7) {
        this.reactions[m.id] = reactions[Math.floor(rand() * 3)];
      }
    });

    return this;
  }

  /**
   * Build the final ReactionMap.
   */
  build(): ReactionMap {
    return this.reactions;
  }
}
