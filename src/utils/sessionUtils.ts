import type { Movie } from './movieUtils';
import type { UniqueMovie, SessionConfig } from '../types/session';
import { SESSIONS } from '../types/session';

/**
 * Generate a stable ID from a movie title.
 * Normalizes to lowercase, replaces non-alphanumeric with hyphens.
 */
export function movieId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Look up a session config by ID. Returns undefined if not found.
 */
export function getSessionConfig(id: string): SessionConfig | undefined {
  return SESSIONS[id];
}

/**
 * Get all known session IDs (for getStaticPaths).
 */
export function getAllSessionIds(): string[] {
  return Object.keys(SESSIONS);
}

/**
 * Deduplicate movies from showtime entries.
 * Groups by movie title, keeps unique films with all their showtimes.
 */
export function deduplicateMovies(movies: Movie[]): UniqueMovie[] {
  const map = new Map<string, UniqueMovie>();

  for (const m of movies) {
    const id = movieId(m.Movie);
    const existing = map.get(id);

    if (existing) {
      existing.showtimes.push({
        datetime: m.Datetime,
        time: m.Time,
        tickets: m.Tickets,
      });
    } else {
      map.set(id, {
        id,
        movie: m,
        showtimes: [
          {
            datetime: m.Datetime,
            time: m.Time,
            tickets: m.Tickets,
          },
        ],
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Sort unique movies by various criteria.
 */
export function sortMovies(
  movies: UniqueMovie[],
  sortBy: string,
  reactions?: Record<string, string>
): UniqueMovie[] {
  const sorted = [...movies];

  switch (sortBy) {
    case 'alpha':
      sorted.sort((a, b) => a.movie.Movie.localeCompare(b.movie.Movie));
      break;
    case 'year':
      sorted.sort((a, b) => {
        const yearA = parseInt(a.movie.year || '0');
        const yearB = parseInt(b.movie.year || '0');
        return yearA - yearB;
      });
      break;
    case 'director':
      sorted.sort((a, b) =>
        (a.movie.director || '').localeCompare(b.movie.director || '')
      );
      break;
    case 'marked':
      if (reactions) {
        const order: Record<string, number> = { yes: 0, maybe: 1, no: 2, none: 3 };
        sorted.sort((a, b) => {
          const ra = reactions[a.id] || 'none';
          const rb = reactions[b.id] || 'none';
          return (order[ra] ?? 3) - (order[rb] ?? 3);
        });
      }
      break;
    default:
      break;
  }

  return sorted;
}
