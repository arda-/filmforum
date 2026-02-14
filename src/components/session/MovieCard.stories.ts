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

const sampleMovie = {
  id: 'movie-1',
  movie: {
    Movie: 'THE GODFATHER',
    Time: '7:00 PM',
    Tickets: 'https://tickets.example.com',
    Datetime: '2024-02-15T19:00:00',
    year: '1972',
    director: 'Francis Ford Coppola',
    runtime: '175',
    actors: 'Marlon Brando, Al Pacino, James Caan',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    country: 'USA',
  },
  showtimes: [
    { datetime: '2024-02-15T19:00:00', time: '7:00 PM', tickets: 'https://tickets.example.com' },
    { datetime: '2024-02-15T21:30:00', time: '9:30 PM', tickets: 'https://tickets.example.com' },
  ],
};

const movieWithoutPoster = {
  id: 'movie-2',
  movie: {
    Movie: 'BREATHLESS',
    Time: '8:00 PM',
    Tickets: 'https://tickets.example.com',
    Datetime: '2024-02-16T20:00:00',
    year: '1960',
    director: 'Jean-Luc Godard',
    runtime: '90',
    actors: 'Jean-Paul Belmondo, Jean Seberg',
    description: 'A small-time thief steals a car and impulsively murders a motorcycle policeman.',
    country: 'France',
  },
  showtimes: [
    { datetime: '2024-02-16T20:00:00', time: '8:00 PM', tickets: 'https://tickets.example.com' },
  ],
};

const shortMovie = {
  id: 'movie-3',
  movie: {
    Movie: 'MESHES OF THE AFTERNOON',
    Time: '6:00 PM',
    Tickets: 'https://tickets.example.com',
    Datetime: '2024-02-17T18:00:00',
    year: '1943',
    director: 'Maya Deren',
    runtime: '14',
    country: 'USA',
  },
  showtimes: [
    { datetime: '2024-02-17T18:00:00', time: '6:00 PM', tickets: 'https://tickets.example.com' },
  ],
};

export default {
  component: MovieCardWrapper,
};

export const Default = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'none',
    showActors: true,
    showBlurb: false,
    showImage: true,
  },
};

export const WithBlurb = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'none',
    showActors: true,
    showBlurb: true,
    showImage: true,
  },
};

export const ReactionYes = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'yes',
    showActors: true,
    showBlurb: false,
    showImage: true,
  },
};

export const ReactionMaybe = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'maybe',
    showActors: true,
    showBlurb: false,
    showImage: true,
  },
};

export const ReactionNo = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'no',
    showActors: true,
    showBlurb: false,
    showImage: true,
  },
};

export const WithoutActors = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'none',
    showActors: false,
    showBlurb: false,
    showImage: true,
  },
};

export const WithoutImage = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'none',
    showActors: true,
    showBlurb: false,
    showImage: false,
  },
};

export const NoPoster = {
  args: {
    uniqueMovie: movieWithoutPoster,
    reaction: 'none',
    showActors: true,
    showBlurb: true,
    showImage: true,
  },
};

export const MinimalInfo = {
  args: {
    uniqueMovie: shortMovie,
    reaction: 'none',
    showActors: true,
    showBlurb: false,
    showImage: true,
  },
};
