/**
 * Shared movie data for Apple Card expansion demos
 */

export interface Movie {
  title: string;
  director: string;
  year: string;
  runtime: string;
  poster: string;
  description: string;
  actors: string;
  showtimes: string[];
}

export interface MovieWithMeta extends Movie {
  genre: string;
  badge: string;
  label: string;
}

export interface SimpleMovie {
  title: string;
  poster: string;
}

export const movies: Movie[] = [
  {
    title: 'Taxi Driver',
    director: 'Martin Scorsese',
    year: '1976',
    runtime: '1h 54m',
    poster: '/posters/taxi-driver.png',
    description: 'A mentally unstable veteran works as a nighttime taxi driver in New York City, where the perceived decadence and sleaze fuels his unraveling, his unhinged mission to save a teenage sex worker.',
    actors: 'Robert De Niro, Jodie Foster, Cybill Shepherd, Harvey Keitel',
    showtimes: ['Today 2:00 PM', 'Today 4:30 PM', 'Today 7:15 PM', 'Tomorrow 1:00 PM'],
  },
  {
    title: 'Mean Streets',
    director: 'Martin Scorsese',
    year: '1973',
    runtime: '1h 52m',
    poster: '/posters/mean-streets.png',
    description: 'A small-time hood tries to keep peace between his reckless, debt-ridden friend and the loan shark who is after him while simultaneously trying to advance in the local Mafia hierarchy.',
    actors: 'Robert De Niro, Harvey Keitel, David Proval, Amy Robinson',
    showtimes: ['Today 3:15 PM', 'Today 6:00 PM', 'Tomorrow 2:30 PM'],
  },
  {
    title: 'The Godfather Part II',
    director: 'Francis Ford Coppola',
    year: '1974',
    runtime: '3h 22m',
    poster: '/posters/the-godfather-part-ii.png',
    description: 'The continuing saga of the Corleone crime family tells the parallel stories of a young Vito Corleone growing up in Sicily and in 1920s New York, and his son Michael expanding and tightening his grip on the family empire.',
    actors: 'Al Pacino, Robert De Niro, Robert Duvall, Diane Keaton',
    showtimes: ['Today 1:00 PM', 'Today 6:30 PM', 'Tomorrow 1:00 PM', 'Tomorrow 6:30 PM'],
  },
  {
    title: 'West Side Story',
    director: 'Robert Wise & Jerome Robbins',
    year: '1961',
    runtime: '2h 33m',
    poster: '/posters/west-side-story.png',
    description: 'Two youngsters from rival New York City gangs fall in love, but tensions between their respective friends build toward tragedy in this adaptation of the classic Broadway musical.',
    actors: 'Natalie Wood, Richard Beymer, Russ Tamblyn, Rita Moreno',
    showtimes: ['Tomorrow 2:00 PM', 'Tomorrow 7:00 PM', 'Sat 4:00 PM', 'Sun 2:00 PM'],
  },
  {
    title: 'The Naked City',
    director: 'Jules Dassin',
    year: '1948',
    runtime: '1h 36m',
    poster: '/posters/the-naked-city.png',
    description: 'A documentary-style police procedural following the investigation of a young model\'s murder on the streets of New York City. Shot entirely on location, a landmark in American cinema.',
    actors: 'Barry Fitzgerald, Howard Duff, Dorothy Hart, Don Taylor',
    showtimes: ['Today 12:30 PM', 'Tomorrow 12:30 PM', 'Tomorrow 3:00 PM'],
  },
  {
    title: 'Once Upon a Time in America',
    director: 'Sergio Leone',
    year: '1984',
    runtime: '3h 49m',
    poster: '/posters/once-upon-a-time-in-america.png',
    description: 'A former Prohibition-era Jewish gangster returns to the Lower East Side of Manhattan over thirty years later, where he must once again confront the ghosts and regrets of his old life.',
    actors: 'Robert De Niro, James Woods, Elizabeth McGovern, Joe Pesci',
    showtimes: ['Sat 1:00 PM', 'Sun 1:00 PM'],
  },
];

/**
 * Movie data with additional metadata for the main demo page
 */
export const moviesWithMeta: MovieWithMeta[] = [
  {
    ...movies[0],
    genre: 'Drama',
    badge: 'NOW SHOWING',
    label: 'FILM FORUM REPERTORY',
  },
  {
    ...movies[1],
    genre: 'Crime / Drama',
    badge: 'FINAL WEEK',
    label: 'SCORSESE RETROSPECTIVE',
  },
  {
    ...movies[2],
    genre: 'Crime / Drama',
    badge: 'SPECIAL EVENT',
    label: 'NEW 4K RESTORATION',
  },
  {
    ...movies[3],
    genre: 'Musical / Drama',
    badge: 'OPENING NIGHT',
    label: 'SUMMER MUSICAL SERIES',
  },
  {
    ...movies[4],
    genre: 'Film Noir',
    badge: 'MATINEE',
    label: 'NOIR ESSENTIALS',
  },
  {
    ...movies[5],
    genre: 'Crime / Drama',
    badge: 'EXTENDED CUT',
    label: 'EPIC CINEMA',
  },
];

/**
 * Simplified movie data (title and poster only) for basic demos
 */
export const simpleMovies: SimpleMovie[] = movies.map(({ title, poster }) => ({
  title,
  poster,
}));
