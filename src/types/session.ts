import type { Movie } from '../utils/movieUtils';

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

/** Session configuration mapping IDs to data sources */
export interface SessionConfig {
  id: string;
  name: string;
  subtitle?: string;
  dataFile: string;
}

/** A unique movie (deduplicated from showtime entries) */
export interface UniqueMovie {
  id: string;
  movie: Movie;
  showtimes: { datetime: string; time: string; tickets: string }[];
}

/** Known sessions */
export const SESSIONS: Record<string, SessionConfig> = {
  'tenement-stories': {
    id: 'tenement-stories',
    name: 'Tenement Stories',
    subtitle: 'Life on the Lower East Side',
    dataFile: '/tenement-stories-full.json',
  },
};
