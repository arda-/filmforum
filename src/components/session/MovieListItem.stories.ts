import MovieListItem from './MovieListItem.astro';

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

const shortMovie = {
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

const minimalMovie = {
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

const longTitleMovie = {
  id: 'movie-4',
  movie: {
    Movie: 'DR. STRANGELOVE OR: HOW I LEARNED TO STOP WORRYING AND LOVE THE BOMB',
    Time: '7:30 PM',
    Tickets: 'https://tickets.example.com',
    Datetime: '2024-02-18T19:30:00',
    year: '1964',
    director: 'Stanley Kubrick',
    runtime: '95',
    actors: 'Peter Sellers, George C. Scott, Sterling Hayden',
    description: 'An insane American general orders a bombing attack on the Soviet Union, triggering a path to nuclear holocaust that a war room full of politicians and generals frantically tries to stop.',
    country: 'USA',
  },
  showtimes: [
    { datetime: '2024-02-18T19:30:00', time: '7:30 PM', tickets: 'https://tickets.example.com' },
  ],
};

export default {
  component: MovieListItem,
};

export const Default = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'none',
    showActors: true,
    showBlurb: false,
  },
};

export const WithBlurb = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'none',
    showActors: true,
    showBlurb: true,
  },
};

export const ReactionYes = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'yes',
    showActors: true,
    showBlurb: false,
  },
};

export const ReactionMaybe = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'maybe',
    showActors: true,
    showBlurb: false,
  },
};

export const ReactionNo = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'no',
    showActors: true,
    showBlurb: false,
  },
};

export const WithoutActors = {
  args: {
    uniqueMovie: sampleMovie,
    reaction: 'none',
    showActors: false,
    showBlurb: false,
  },
};

export const ShortMovie = {
  args: {
    uniqueMovie: shortMovie,
    reaction: 'none',
    showActors: true,
    showBlurb: true,
  },
};

export const MinimalInfo = {
  args: {
    uniqueMovie: minimalMovie,
    reaction: 'none',
    showActors: true,
    showBlurb: false,
  },
};

export const LongTitle = {
  args: {
    uniqueMovie: longTitleMovie,
    reaction: 'none',
    showActors: true,
    showBlurb: true,
  },
};
