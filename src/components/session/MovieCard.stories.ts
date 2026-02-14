/**
 * MovieCard component stories
 *
 * NOTE: Astrobook does NOT support passing slot content directly to components.
 * The MovieCard component needs padding around it to prevent the card's outline
 * and shadow from being clipped at the container edges. We use a MovieCardWrapper
 * decorator that adds 20px of padding around the component.
 *
 * See: decorators/MovieCardWrapper.astro
 */
import MovieCardWrapper from '../decorators/MovieCardWrapper.astro';
import {
  uniqueMovieWithPoster,
  uniqueMovieWithoutPoster,
  uniqueMovieMinimal,
} from '../../stories/fixtures';

export default {
  component: MovieCardWrapper,
};

/**
 * Basic state: Shows title, year, director, runtime, and poster image
 */
export const Default = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'none',
    showActors: false,
    showBlurb: false,
    showImage: true,
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
    showImage: true,
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
    showImage: true,
  },
};

/**
 * Demonstrates poster image display with all features enabled
 */
export const WithAllFeatures = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'none',
    showActors: true,
    showBlurb: true,
    showImage: true,
  },
};

/**
 * Shows card when movie data lacks a poster image
 */
export const WithoutPoster = {
  args: {
    uniqueMovie: uniqueMovieWithoutPoster,
    reaction: 'none',
    showActors: true,
    showBlurb: true,
    showImage: true,
  },
};

/**
 * Shows card with minimal movie information (no actors or description in data)
 */
export const MinimalData = {
  args: {
    uniqueMovie: uniqueMovieMinimal,
    reaction: 'none',
    showActors: true,
    showBlurb: false,
    showImage: true,
  },
};

/**
 * Shows positive user reaction state
 */
export const ReactionYes = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'yes',
    showActors: true,
    showBlurb: false,
    showImage: true,
  },
};

/**
 * Shows neutral/uncertain user reaction state
 */
export const ReactionMaybe = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'maybe',
    showActors: true,
    showBlurb: false,
    showImage: true,
  },
};

/**
 * Shows negative user reaction state
 */
export const ReactionNo = {
  args: {
    uniqueMovie: uniqueMovieWithPoster,
    reaction: 'no',
    showActors: true,
    showBlurb: false,
    showImage: true,
  },
};
