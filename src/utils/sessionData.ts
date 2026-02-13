/**
 * Shared data loading for session list pages.
 * Extracts the common frontmatter logic used by /cards and /list routes.
 */
import type { Movie } from '@types/movie';
import type { UniqueMovie } from '@types/session';
import type { SeriesConfig } from '@config/series';
import {
  deduplicateMovies,
  sortMovies,
  extractFilterOptions,
  type FilterOptions,
} from '@utils/sessionUtils';
import { toTitleCase } from '@utils/movieUtils';

export interface SessionListData {
  uniqueMovies: UniqueMovie[];
  filters: FilterOptions;
  seo: {
    title: string;
    description: string;
    canonical: string;
    ogImage: string | null;
    structuredData: object;
  };
}

/**
 * Load and prepare all movie data for a session list page.
 * Reads the JSON data file, deduplicates, sorts, and extracts filter options.
 */
export async function loadSessionListData(
  id: string,
  config: SeriesConfig
): Promise<SessionListData> {
  let allMovies: Movie[] = [];
  try {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const dataPath = path.join(process.cwd(), 'public', config.dataFile);
    const data = fs.readFileSync(dataPath, 'utf-8');
    allMovies = JSON.parse(data);
  } catch (e) {
    console.warn(
      `[${id}] Failed to load movie data:`,
      e instanceof Error ? e.message : e
    );
    allMovies = [];
  }

  const uniqueMovies = sortMovies(deduplicateMovies(allMovies), 'alpha');
  const filters = extractFilterOptions(uniqueMovies);

  const title = `${config.name} Movie List - Browse ${uniqueMovies.length} Films`;
  const description = `Browse all ${uniqueMovies.length} films in ${config.name}. Mark your favorites (Yes/Maybe/No), create a shareable list, and plan your ${config.venueName} visits.`;
  const canonical = `/s/${id}/list`;
  const ogImage = allMovies[0]?.poster_url || null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${config.name} - Movie List`,
    numberOfItems: uniqueMovies.length,
    itemListElement: uniqueMovies.slice(0, 20).map((um, index) => ({
      '@type': 'Movie',
      position: index + 1,
      name: toTitleCase(um.movie.Movie),
      director: um.movie.director
        ? toTitleCase(um.movie.director)
        : undefined,
      datePublished: um.movie.year,
    })),
  };

  return {
    uniqueMovies,
    filters,
    seo: { title, description, canonical, ogImage, structuredData },
  };
}
