/**
 * MovieListItem component stories
 *
 * Stories demonstrate the MovieListItem component in different states.
 * Each story showcases specific features or content variations.
 */
import MovieListItem from './MovieListItem.astro';
import {
  uniqueMovieWithPoster,
  uniqueMovieWithoutPoster,
  uniqueMovieMinimal,
} from '../../stories/fixtures';

export default {
  component: MovieListItem,
};

/**
 * Basic state: Shows title, director, year, runtime (minimal display without actors)
 */
export const Default = {
  args: {
    uniqueMovie: uniqueMovieMinimal,
    reaction: 'none',
    showActors: false,
    showBlurb: false,
  },
};

/**
 * Demonstrates the actors field when enabled
 */
export const WithActors = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'none',
    showActors: true,
    showBlurb: false,
  },
};

/**
 * Demonstrates the description/blurb when enabled
 */
export const WithBlurb = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'none',
    showActors: false,
    showBlurb: true,
  },
};

/**
 * Demonstrates all features enabled together
 */
export const WithAllFeatures = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'none',
    showActors: true,
    showBlurb: true,
  },
};

/**
 * Shows positive user reaction state
 */
export const Reaction_yes = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'yes',
    showActors: true,
    showBlurb: false,
  },
};

/**
 * Shows neutral/uncertain user reaction state
 */
export const Reaction_maybe = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'maybe',
    showActors: true,
    showBlurb: false,
  },
};

/**
 * Shows negative user reaction state
 */
export const Reaction_no = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'no',
    showActors: true,
    showBlurb: false,
  },
};
