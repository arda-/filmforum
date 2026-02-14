import type { Movie } from '@types/movie';
import type { UniqueMovie } from '@types/session';

/** Filter criteria for movie list filtering. */
export interface MovieFilters {
  query: string;
  director: string;
  actor: string;
  decades: string[];
}

/** Result of extracting filter options from a movie list. */
export interface FilterOptions {
  directors: string[];
  actors: string[];
  decades: string[];
}

/**
 * Deduplicate movies from showtime entries.
 * Groups by film_slug (extracted during scraping), keeps unique films with all their showtimes.
 */
export function deduplicateMovies(movies: Movie[]): UniqueMovie[] {
  const map = new Map<string, UniqueMovie>();

  for (const m of movies) {
    const id = m.film_slug;
    const existing = map.get(id);

    if (existing) {
      existing.showtimes.push({
        datetime: m.Datetime,
        time: m.Time,
        tickets: m.ticket_url,
      });
    } else {
      map.set(id, {
        id,
        movie: m,
        showtimes: [
          {
            datetime: m.Datetime,
            time: m.Time,
            tickets: m.ticket_url,
          },
        ],
      });
    }
  }

  return Array.from(map.values());
}

/** Strip leading articles (A, An, The) for index-style sorting. */
function sortKey(title: string): string {
  return title.replace(/^(a|an|the)\s+/i, '');
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
      sorted.sort((a, b) => sortKey(a.movie.Movie).localeCompare(sortKey(b.movie.Movie)));
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

/**
 * Convert a year string to a decade label (e.g. "1932" → "1930s").
 * Returns empty string for invalid or missing years.
 */
export function getDecade(year: string): string {
  const y = parseInt(year);
  if (isNaN(y)) return '';
  return `${Math.floor(y / 10) * 10}s`;
}

/**
 * Extract unique, sorted filter options from a list of unique movies.
 * Returns deduplicated directors, actors, and decades.
 */
export function extractFilterOptions(movies: UniqueMovie[]): FilterOptions {
  const directorsSet = new Set<string>();
  const actorsSet = new Set<string>();
  const decadesSet = new Set<string>();

  for (const um of movies) {
    const m = um.movie;
    if (m.director) directorsSet.add(m.director);
    if (m.actors) {
      for (const actor of m.actors.split(', ')) {
        const trimmed = actor.trim();
        if (trimmed) actorsSet.add(trimmed);
      }
    }
    if (m.year) {
      const decade = getDecade(m.year);
      if (decade) decadesSet.add(decade);
    }
  }

  return {
    directors: [...directorsSet].sort((a, b) => a.localeCompare(b)),
    actors: [...actorsSet].sort((a, b) => a.localeCompare(b)),
    decades: [...decadesSet].sort(),
  };
}

/**
 * Test whether a movie matches the given filter criteria.
 * All active filters use AND logic. Text search matches across
 * title, director, and actors. Actor dropdown matches whole names
 * within the comma-separated actors list.
 *
 * All string comparisons are case-insensitive — callers should pass
 * lowercase values for title, director, and actors.
 */
export function matchesFilter(
  movie: { title: string; director: string; actors: string; year: string },
  filters: MovieFilters
): boolean {
  const { query, director, actor, decades } = filters;

  // Text search: matches title, director, or actors
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    const matchesSearch =
      movie.title.includes(q) ||
      movie.director.includes(q) ||
      movie.actors.includes(q);
    if (!matchesSearch) return false;
  }

  // Director filter: exact match on full director string
  if (director && movie.director !== director.toLowerCase()) {
    return false;
  }

  // Actor filter: match whole actor names within comma-separated list
  if (actor) {
    const actorLower = actor.toLowerCase();
    const actorList = movie.actors.split(', ').map(a => a.trim());
    if (!actorList.includes(actorLower)) return false;
  }

  // Decade filter: match any of the selected decades
  if (decades.length > 0) {
    const movieDecade = getDecade(movie.year);
    if (!movieDecade || !decades.includes(movieDecade)) return false;
  }

  return true;
}
