import fs from 'node:fs';
import path from 'node:path';
import type { Movie } from '../types/movie';

/**
 * Load movie data at build time from a JSON file in the public directory.
 * @param dataFile - Path to the JSON file, with or without leading slash (e.g., '/tenement-stories-full.json' or 'tenement-stories-full.json')
 * @returns Parsed movie data array and serialized JSON string for client-side injection
 */
export function loadMovieData(dataFile: string) {
  // Strip leading slash if present to ensure consistent path.join behavior
  const normalizedPath = dataFile.startsWith('/') ? dataFile.slice(1) : dataFile;
  const dataPath = path.join(process.cwd(), 'public', normalizedPath);
  const movieData: Movie[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const movieDataJson = JSON.stringify(movieData);

  return { movieData, movieDataJson };
}
