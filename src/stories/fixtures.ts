/**
 * Fixture data for Storybook stories
 * Provides sample movie data matching the Movie and UniqueMovie types
 */

import type { Movie } from '../types/movie';
import type { UniqueMovie, ReactionMap } from '../types/session';

/**
 * Sample movie data with poster
 */
export const movieWithPoster: Movie = {
  Movie: 'LONESOME',
  Time: '12:30',
  Tickets: 'https://my.filmforum.org/events/lonesome',
  Datetime: '2026-02-06T12:30:00',
  year: '1928',
  director: 'Paul Fejos',
  runtime: '70 min',
  actors: 'Barbara Kent, Glenn Tryon',
  description:
    "Glenn Tryon and Barbara Kent, two single-roomed Gotham dwellers, meet and lose each other at a Coney Island excursion. Fejos' tour de force was part of a movement towards the ordinary Joes in the audience.",
  country: 'U.S.',
  film_url: 'https://filmforum.org/film/lonesome',
  poster_url: '/posters/lonesome.png',
};

/**
 * Sample movie data without poster
 */
export const movieWithoutPoster: Movie = {
  Movie: 'THE APARTMENT',
  Time: '7:30',
  Tickets: 'https://my.filmforum.org/events/the-apartment',
  Datetime: '2026-02-15T19:30:00',
  year: '1960',
  director: 'Billy Wilder',
  runtime: '125 min',
  actors: 'Jack Lemmon, Shirley MacLaine, Fred MacMurray',
  description:
    'A man tries to rise in his company by letting its executives use his apartment for trysts, only to be discovered by the girl he loves.',
  country: 'U.S.',
  film_url: 'https://filmforum.org/film/the-apartment',
};

/**
 * Sample movie with minimal data
 */
export const movieMinimal: Movie = {
  Movie: 'CITY LIGHTS',
  Time: '3:00',
  Tickets: 'https://my.filmforum.org/events/city-lights',
  Datetime: '2026-02-20T15:00:00',
  year: '1931',
  director: 'Charlie Chaplin',
  runtime: '87 min',
  country: 'U.S.',
};

/**
 * Sample unique movie (deduplicated with showtimes)
 */
export const uniqueMovieWithPoster: UniqueMovie = {
  id: 'lonesome-1928',
  movie: movieWithPoster,
  showtimes: [
    { datetime: '2026-02-06T12:30:00', time: '12:30', tickets: 'https://my.filmforum.org/events/lonesome' },
    { datetime: '2026-02-06T19:30:00', time: '7:30', tickets: 'https://my.filmforum.org/events/lonesome' },
  ],
};

/**
 * Sample unique movie without poster
 */
export const uniqueMovieWithoutPoster: UniqueMovie = {
  id: 'the-apartment-1960',
  movie: movieWithoutPoster,
  showtimes: [
    { datetime: '2026-02-15T19:30:00', time: '7:30', tickets: 'https://my.filmforum.org/events/the-apartment' },
    { datetime: '2026-02-16T15:00:00', time: '3:00', tickets: 'https://my.filmforum.org/events/the-apartment' },
  ],
};

/**
 * Sample unique movie with minimal data
 */
export const uniqueMovieMinimal: UniqueMovie = {
  id: 'city-lights-1931',
  movie: movieMinimal,
  showtimes: [
    { datetime: '2026-02-20T15:00:00', time: '3:00', tickets: 'https://my.filmforum.org/events/city-lights' },
  ],
};

/**
 * Collection of sample movies for grid/list views
 */
export const sampleMovies: UniqueMovie[] = [
  uniqueMovieWithPoster,
  uniqueMovieWithoutPoster,
  uniqueMovieMinimal,
];

/**
 * Sample reaction map for testing
 */
export const sampleReactions: ReactionMap = {
  'lonesome-1928': 'yes',
  'the-apartment-1960': 'maybe',
  'city-lights-1931': 'none',
};
