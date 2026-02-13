import type { UniqueMovie, MovieReaction, ReactionMap } from '@types/session';

/** Categories for comparison results */
export type Category = 'strong' | 'possible' | 'disagree' | 'pass' | 'unreviewed';

/** A movie with both users' reactions and computed category */
export interface CompareItem {
  movie: UniqueMovie;
  reactionA: MovieReaction;
  reactionB: MovieReaction;
  category: Category;
}

/**
 * Categorizes movies based on two users' reactions.
 *
 * Categories:
 * - strong: Both said "yes"
 * - possible: Yes+Maybe, Maybe+Yes, or Maybe+Maybe
 * - disagree: Yes+No, Maybe+No, or No+Yes, No+Maybe
 * - pass: Both said "no"
 * - unreviewed: At least one has no reaction ('none')
 *
 * @param allMovies - The complete list of movies to categorize
 * @param listA - User A's reactions (movie ID → reaction)
 * @param listB - User B's reactions (movie ID → reaction)
 * @returns Array of CompareItems with categorization for each movie
 */
export function categorizeMovies(
  allMovies: UniqueMovie[],
  listA: ReactionMap,
  listB: ReactionMap
): CompareItem[] {
  return allMovies.map(m => {
    const rA: MovieReaction = listA[m.id] || 'none';
    const rB: MovieReaction = listB[m.id] || 'none';
    let category: Category = 'unreviewed';

    if (rA === 'none' || rB === 'none') {
      category = 'unreviewed';
    } else if (rA === 'yes' && rB === 'yes') {
      category = 'strong';
    } else if (
      (rA === 'yes' && rB === 'maybe') ||
      (rA === 'maybe' && rB === 'yes') ||
      (rA === 'maybe' && rB === 'maybe')
    ) {
      category = 'possible';
    } else if (rA === 'no' && rB === 'no') {
      category = 'pass';
    } else {
      category = 'disagree';
    }

    return { movie: m, reactionA: rA, reactionB: rB, category };
  });
}
