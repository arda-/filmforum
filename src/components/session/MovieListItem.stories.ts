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
 * Basic state: Shows title, director, year, runtime
 */
export const Default = {
  args: {
    uniqueMovie: uniqueMovieMinimal,
    reaction: 'none',
  },
};

/**
 * Shows positive user reaction state
 */
export const Reaction_yes = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'yes',
  },
};

/**
 * Shows neutral/uncertain user reaction state
 */
export const Reaction_maybe = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'maybe',
  },
};

/**
 * Shows negative user reaction state
 */
export const Reaction_no = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'no',
  },
};
