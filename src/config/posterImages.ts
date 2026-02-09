/**
 * Poster Image Validation
 *
 * Provides build-time validation that all movie data has corresponding poster images.
 * Validation runs at build start and fails the build if any images are missing.
 *
 * For optimized image loading in components, use getPosterImageModule() which
 * uses import.meta.glob to load images from src/assets/posters/ at build time.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ImageMetadata } from 'astro';

/**
 * Get list of available poster files at build time
 * Used for validation and debugging
 */
function getAvailablePosterFiles(): Set<string> {
  const postersDirs = [
    path.join(process.cwd(), 'src/assets/posters'),
    path.join(process.cwd(), 'public/posters')
  ];

  const files = new Set<string>();

  for (const dir of postersDirs) {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir)
        .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'))
        .forEach(f => {
          const filename = f.replace(/\.(png|jpg|jpeg)$/, '');
          files.add(filename);
        });
    }
  }

  return files;
}

/**
 * Validate that all movies in the dataset have corresponding poster images
 * Called at build time to catch missing images early
 *
 * @throws Error if any movie references a missing poster image
 */
export function validatePosterImages(
  movies: Array<{ Movie: string; poster_url?: string }>
): void {
  const availablePosters = getAvailablePosterFiles();
  const missing: string[] = [];

  for (const movie of movies) {
    if (!movie.poster_url) continue;

    const posterFilename = movie.poster_url
      .split('/')
      .pop()
      ?.replace(/\.(png|jpg|jpeg)$/, '');

    if (!posterFilename || !availablePosters.has(posterFilename)) {
      missing.push(`${movie.Movie} (${movie.poster_url})`);
    }
  }

  if (missing.length > 0) {
    const missingList = missing.join('\n  - ');
    const availableList = Array.from(availablePosters)
      .sort()
      .slice(0, 5)
      .map(f => `  - ${f}`)
      .join('\n');

    throw new Error(
      `Missing poster images:\n  - ${missingList}\n\n` +
      `Available posters (showing first 5):\n${availableList}\n\n` +
      `Add images to src/assets/posters/ or public/posters/`
    );
  }
}

/**
 * List all available poster filenames
 * Useful for debugging and monitoring which images are available
 */
export function listAvailablePosterImages(): string[] {
  return Array.from(getAvailablePosterFiles()).sort();
}
