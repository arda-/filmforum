import SingleCardView from './SingleCardView.astro';
import { sampleMovies, uniqueMovieWithPoster, uniqueMovieWithoutPoster, uniqueMovieMinimal } from '../../stories/fixtures';

export default {
  component: SingleCardView,
};

/**
 * Default state with multiple movies
 * The drawer starts hidden and can be opened programmatically via window.singleCardController.open(index)
 */
export const Default = {
  args: {
    movies: sampleMovies,
    reactions: {},
    hidden: true,
  },
};

/**
 * Single movie with poster
 * Demonstrates a movie with a full-bleed hero image
 */
export const SingleMovieWithPoster = {
  args: {
    movies: [uniqueMovieWithPoster],
    reactions: {},
    hidden: true,
  },
};

/**
 * Single movie without poster
 * Shows fallback placeholder when no poster is available
 */
export const SingleMovieWithoutPoster = {
  args: {
    movies: [uniqueMovieWithoutPoster],
    reactions: {},
    hidden: true,
  },
};

/**
 * Movie with minimal data
 * Demonstrates how the component handles sparse information
 */
export const MinimalData = {
  args: {
    movies: [uniqueMovieMinimal],
    reactions: {},
    hidden: true,
  },
};

/**
 * Movie with "Yes" reaction
 * Shows active state for the yes button
 */
export const ReactionYes = {
  args: {
    movies: [uniqueMovieWithPoster],
    reactions: {
      'lonesome-1928': 'yes',
    },
    hidden: true,
  },
};

/**
 * Movie with "Maybe" reaction
 * Shows active state for the maybe button
 */
export const ReactionMaybe = {
  args: {
    movies: [uniqueMovieWithPoster],
    reactions: {
      'lonesome-1928': 'maybe',
    },
    hidden: true,
  },
};

/**
 * Movie with "No" reaction
 * Shows active state for the no button
 */
export const ReactionNo = {
  args: {
    movies: [uniqueMovieWithPoster],
    reactions: {
      'lonesome-1928': 'no',
    },
    hidden: true,
  },
};

/**
 * Multiple movies with mixed reactions
 * Demonstrates navigation between movies with different reaction states
 */
export const MixedReactions = {
  args: {
    movies: sampleMovies,
    reactions: {
      'lonesome-1928': 'yes',
      'the-apartment-1960': 'maybe',
      'city-lights-1931': 'no',
    },
    hidden: true,
  },
};

/**
 * Pre-opened drawer state
 * Useful for testing the open state without needing to trigger the animation
 * Note: In a real scenario, use window.singleCardController.open(0) to open programmatically
 */
export const PreOpened = {
  args: {
    movies: [uniqueMovieWithPoster],
    reactions: {},
    hidden: false,
  },
};
