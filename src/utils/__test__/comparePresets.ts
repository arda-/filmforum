/**
 * Preset comparison scenarios for testing list comparison logic.
 * Each scenario returns movies + two reaction lists + expected category counts.
 */

import { MovieBuilder, ReactionBuilder } from './fixtures';
import type { UniqueMovie, ReactionMap } from '../../types/session';
import type { Category } from '../listComparison';

export interface ComparePreset {
  name: string;
  movies: UniqueMovie[];
  listA: ReactionMap;
  listB: ReactionMap;
  expected: Record<Category, number>;
}

/**
 * Perfect agreement: Both users say yes to the same movies.
 * Expected: All in "strong" category.
 */
export function perfectAgreement(): ComparePreset {
  const movies = MovieBuilder.create(5).build();
  const listA = ReactionBuilder.for(movies).yes(0, 1, 2, 3, 4).build();
  const listB = ReactionBuilder.for(movies).yes(0, 1, 2, 3, 4).build();

  return {
    name: 'Perfect Agreement',
    movies,
    listA,
    listB,
    expected: {
      strong: 5,
      possible: 0,
      disagree: 0,
      pass: 0,
      unreviewed: 0,
    },
  };
}

/**
 * Total disagreement: One says yes, the other says no to every movie.
 * Expected: All in "disagree" category.
 */
export function totalDisagreement(): ComparePreset {
  const movies = MovieBuilder.create(5).build();
  const listA = ReactionBuilder.for(movies).yes(0, 1, 2, 3, 4).build();
  const listB = ReactionBuilder.for(movies).no(0, 1, 2, 3, 4).build();

  return {
    name: 'Total Disagreement',
    movies,
    listA,
    listB,
    expected: {
      strong: 0,
      possible: 0,
      disagree: 5,
      pass: 0,
      unreviewed: 0,
    },
  };
}

/**
 * Mixed overlap: Realistic scenario with movies in each category.
 */
export function mixedOverlap(): ComparePreset {
  const movies = MovieBuilder.create(15).build();
  const listA = ReactionBuilder.for(movies)
    .yes(0, 1, 2)      // strong (both yes)
    .maybe(3, 4)       // possible (A maybe, B yes)
    .yes(5, 6)         // disagree (A yes, B no)
    .no(7, 8)          // pass (both no)
    .maybe(9)          // possible (both maybe)
    // 10-14 left unreviewed by A
    .build();

  const listB = ReactionBuilder.for(movies)
    .yes(0, 1, 2)      // strong (both yes)
    .yes(3, 4)         // possible (B yes, A maybe)
    .no(5, 6)          // disagree (B no, A yes)
    .no(7, 8)          // pass (both no)
    .maybe(9)          // possible (both maybe)
    .yes(10, 11)       // unreviewed (B yes, A none)
    // 12-14 left unreviewed by both
    .build();

  return {
    name: 'Mixed Overlap',
    movies,
    listA,
    listB,
    expected: {
      strong: 3,      // 0, 1, 2
      possible: 3,    // 3, 4, 9
      disagree: 2,    // 5, 6
      pass: 2,        // 7, 8
      unreviewed: 5,  // 10, 11, 12, 13, 14
    },
  };
}

/**
 * One empty list: User A has reactions, User B has none.
 * Expected: All in "unreviewed" category.
 */
export function oneEmptyList(): ComparePreset {
  const movies = MovieBuilder.create(5).build();
  const listA = ReactionBuilder.for(movies).yes(0, 1).maybe(2).no(3, 4).build();
  const listB: ReactionMap = {}; // Empty

  return {
    name: 'One Empty List',
    movies,
    listA,
    listB,
    expected: {
      strong: 0,
      possible: 0,
      disagree: 0,
      pass: 0,
      unreviewed: 5,
    },
  };
}

/**
 * Both empty lists: Neither user has reacted.
 * Expected: All in "unreviewed" category.
 */
export function bothEmptyLists(): ComparePreset {
  const movies = MovieBuilder.create(5).build();
  const listA: ReactionMap = {}; // Empty
  const listB: ReactionMap = {}; // Empty

  return {
    name: 'Both Empty Lists',
    movies,
    listA,
    listB,
    expected: {
      strong: 0,
      possible: 0,
      disagree: 0,
      pass: 0,
      unreviewed: 5,
    },
  };
}

/**
 * All maybes: Both users say maybe to everything.
 * Expected: All in "possible" category.
 */
export function allMaybes(): ComparePreset {
  const movies = MovieBuilder.create(5).build();
  const listA = ReactionBuilder.for(movies).all('maybe').build();
  const listB = ReactionBuilder.for(movies).all('maybe').build();

  return {
    name: 'All Maybes',
    movies,
    listA,
    listB,
    expected: {
      strong: 0,
      possible: 5,
      disagree: 0,
      pass: 0,
      unreviewed: 0,
    },
  };
}

/**
 * Yes vs Maybe: One says yes, the other says maybe.
 * Expected: All in "possible" category.
 */
export function yesVsMaybe(): ComparePreset {
  const movies = MovieBuilder.create(5).build();
  const listA = ReactionBuilder.for(movies).all('yes').build();
  const listB = ReactionBuilder.for(movies).all('maybe').build();

  return {
    name: 'Yes vs Maybe',
    movies,
    listA,
    listB,
    expected: {
      strong: 0,
      possible: 5,
      disagree: 0,
      pass: 0,
      unreviewed: 0,
    },
  };
}

/**
 * Partial overlap: Some movies reviewed by both, some by one, some by neither.
 */
export function partialOverlap(): ComparePreset {
  const movies = MovieBuilder.create(10).build();
  const listA = ReactionBuilder.for(movies)
    .yes(0, 1)    // Reviewed by A only
    .yes(2, 3)    // Reviewed by both (strong)
    // 4-9 not reviewed by A
    .build();

  const listB = ReactionBuilder.for(movies)
    .yes(2, 3)    // Reviewed by both (strong)
    .maybe(4, 5)  // Reviewed by B only
    // 0, 1, 6-9 not reviewed by B
    .build();

  return {
    name: 'Partial Overlap',
    movies,
    listA,
    listB,
    expected: {
      strong: 2,      // 2, 3
      possible: 0,
      disagree: 0,
      pass: 0,
      unreviewed: 8,  // 0, 1, 4, 5, 6, 7, 8, 9
    },
  };
}

/**
 * Single movie: Only 1 movie in the list (minimal case).
 */
export function singleMovie(): ComparePreset {
  const movies = MovieBuilder.create(1).build();
  const listA = ReactionBuilder.for(movies).yes(0).build();
  const listB = ReactionBuilder.for(movies).yes(0).build();

  return {
    name: 'Single Movie',
    movies,
    listA,
    listB,
    expected: {
      strong: 1,
      possible: 0,
      disagree: 0,
      pass: 0,
      unreviewed: 0,
    },
  };
}

/**
 * Dense reactions: Every movie has a reaction from both users.
 */
export function denseReactions(): ComparePreset {
  const movies = MovieBuilder.create(12).build();
  const listA = ReactionBuilder.for(movies)
    .yes(0, 1, 2, 3)
    .maybe(4, 5, 6, 7)
    .no(8, 9, 10, 11)
    .build();

  const listB = ReactionBuilder.for(movies)
    .yes(0, 1)         // strong (2 movies)
    .maybe(2, 3)       // possible (2 movies)
    .yes(4, 5)         // possible (2 movies)
    .maybe(6, 7)       // possible (2 movies)
    .yes(8, 9)         // disagree (2 movies)
    .no(10, 11)        // pass (2 movies)
    .build();

  return {
    name: 'Dense Reactions',
    movies,
    listA,
    listB,
    expected: {
      strong: 2,      // 0, 1
      possible: 6,    // 2, 3, 4, 5, 6, 7
      disagree: 2,    // 8, 9
      pass: 2,        // 10, 11
      unreviewed: 0,
    },
  };
}

/**
 * Enthusiast vs Critic: User A says yes to 80%, User B says no to 80%.
 */
export function enthusiastVsCritic(): ComparePreset {
  const movies = MovieBuilder.create(10).build();
  const listA = ReactionBuilder.for(movies)
    .yes(0, 1, 2, 3, 4, 5, 6, 7)  // 80% yes
    .no(8, 9)                      // 20% no
    .build();

  const listB = ReactionBuilder.for(movies)
    .no(0, 1, 2, 3, 4, 5, 6, 7)   // 80% no
    .yes(8, 9)                     // 20% yes
    .build();

  return {
    name: 'Enthusiast vs Critic',
    movies,
    listA,
    listB,
    expected: {
      strong: 0,
      possible: 0,
      disagree: 10,    // All movies are disagreements
      pass: 0,
      unreviewed: 0,
    },
  };
}

/**
 * All presets as an array for easy iteration.
 */
export const ALL_PRESETS: ComparePreset[] = [
  perfectAgreement(),
  totalDisagreement(),
  mixedOverlap(),
  oneEmptyList(),
  bothEmptyLists(),
  allMaybes(),
  yesVsMaybe(),
  partialOverlap(),
  singleMovie(),
  denseReactions(),
  enthusiastVsCritic(),
];
