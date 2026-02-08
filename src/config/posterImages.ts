/**
 * Poster Image Validation & Lookup
 *
 * This module provides:
 * - Build-time validation that all movie data has corresponding poster images
 * - Runtime lookup for available poster images
 * - Clear audit trail of image status
 *
 * Images are stored in:
 * - src/assets/posters/ - For Astro optimization (WebP/AVIF conversion)
 * - public/posters/ - Fallback for dynamic runtime loading
 */

import fs from 'node:fs';
import path from 'node:path';

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
 * Extract poster filename from URL
 * Handles both full paths and simple filenames
 *
 * @example
 * extractPosterFilename('/posters/taxi-driver.png') -> 'taxi-driver'
 * extractPosterFilename('taxi-driver.png') -> 'taxi-driver'
 */
function extractPosterFilename(posterUrl: string | undefined): string | null {
  if (!posterUrl) return null;

  return posterUrl
    .split('/')
    .pop()
    ?.replace('.png', '')
    ?.replace(/\..*$/, '') || null;
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

    const posterFilename = extractPosterFilename(movie.poster_url);
    if (!posterFilename || !availablePosters.has(posterFilename)) {
      missing.push(`${movie.Movie} (${movie.poster_url})`);
    }
  }

  if (missing.length > 0) {
    const missingList = missing.join('\n  - ');
    const availableList = Array.from(availablePosters)
      .sort()
      .slice(0, 5)
      .map(f => `  - ${f}.png`)
      .join('\n');

    throw new Error(
      `Missing poster images:\n  - ${missingList}\n\n` +
      `Available posters (showing first 5):\n${availableList}\n\n` +
      `Add images to src/assets/posters/ or public/posters/`
    );
  }
}

/**
 * Get poster image URL for runtime use
 * Used by components that load images dynamically
 *
 * @param posterUrl - The poster URL or filename
 * @returns The poster URL for use with img tags
 */
export function getPosterImageUrl(posterUrl: string | undefined): string | null {
  if (!posterUrl) return null;
  // Return as-is - will be served from public/posters or src/assets/posters
  return posterUrl;
}

/**
 * List all available poster filenames
 * Useful for debugging and monitoring
 */
export function listAvailablePosterImages(): string[] {
  return Array.from(getAvailablePosterFiles()).sort();
}

/**
 * Type definition for image metadata (matches Astro's ImageMetadata)
 */
export type ImageMetadata = {
  src: string;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'jpeg' | 'tiff' | 'webp' | 'gif' | 'svg';
};
