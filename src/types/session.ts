import type { Movie } from './movie';

/** Reaction states for a movie */
export type MovieReaction = 'yes' | 'maybe' | 'no' | 'none';

/** Map of movie ID → reaction */
export type ReactionMap = Record<string, MovieReaction>;

/** A user's list of reactions for a session */
export interface UserList {
  userId: string;
  sessionId: string;
  reactions: ReactionMap;
}

/** A unique movie (deduplicated from showtime entries) */
export interface UniqueMovie {
  id: string;
  movie: Movie;
  showtimes: { datetime: string; time: string; tickets: string }[];
}

