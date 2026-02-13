/**
 * Series Metadata Validation
 *
 * Provides build-time validation that series metadata files exist, are valid JSON,
 * and that all referenced hero images exist.
 */

import fs from 'node:fs';
import path from 'node:path';

// TODO: Replace [key: string]: unknown with fully typed fields once the metadata
// schema stabilizes. This would let TypeScript verify the validation logic matches
// the actual data shape, and allow the demo page to drop its `any` annotations.
interface SeriesMetadata {
  id: string;
  name: string;
  heroImages?: Array<{
    filename: string;
    path: string;
    alt: string;
  }>;
  [key: string]: unknown;
}

/**
 * Validate that a series metadata file exists and is valid JSON
 * @throws Error if file doesn't exist or is invalid JSON
 */
function validateMetadataFile(metadataPath: string, seriesId: string): SeriesMetadata {
  const fullPath = path.join(process.cwd(), 'public', metadataPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `Series metadata file not found for "${seriesId}": ${metadataPath}\n` +
      `Expected at: ${fullPath}`
    );
  }

  let metadata: SeriesMetadata;
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    metadata = JSON.parse(content);
  } catch (e) {
    throw new Error(
      `Invalid JSON in series metadata file for "${seriesId}": ${metadataPath}\n` +
      `Error: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  // Validate required fields
  if (!metadata.id || !metadata.name) {
    throw new Error(
      `Series metadata missing required fields (id, name) for "${seriesId}": ${metadataPath}`
    );
  }

  if (metadata.id !== seriesId) {
    throw new Error(
      `Series metadata ID mismatch for "${seriesId}": ` +
      `metadata has id="${metadata.id}" but config has id="${seriesId}"`
    );
  }

  return metadata;
}

/**
 * Validate that all hero images referenced in metadata exist
 * @throws Error if any images are missing
 */
function validateHeroImages(metadata: SeriesMetadata, seriesId: string): void {
  if (!metadata.heroImages || metadata.heroImages.length === 0) {
    return; // No hero images is fine
  }

  const missing: string[] = [];

  for (const image of metadata.heroImages) {
    if (!image.path) {
      missing.push(`(missing path field in heroImages array)`);
      continue;
    }

    const imagePath = path.join(process.cwd(), 'public', image.path);
    if (!fs.existsSync(imagePath)) {
      missing.push(`${image.filename || 'unnamed'} (${image.path})`);
    }
  }

  if (missing.length > 0) {
    const missingList = missing.map(m => `  - ${m}`).join('\n');
    throw new Error(
      `Missing hero images for series "${seriesId}":\n${missingList}\n\n` +
      `Add images to the appropriate public/ directory`
    );
  }
}

/**
 * Validate all series metadata files
 * Called at build time to catch issues early
 *
 * @param seriesConfigs Array of series configurations to validate
 * @throws Error if any metadata files or images are missing/invalid
 */
export function validateSeriesMetadata(
  seriesConfigs: Array<{
    id: string;
    metadataFile?: string;
  }>
): void {
  let validatedCount = 0;
  let imageCount = 0;

  for (const series of seriesConfigs) {
    if (!series.metadataFile) {
      continue; // Metadata file is optional
    }

    const metadata = validateMetadataFile(series.metadataFile, series.id);
    validateHeroImages(metadata, series.id);

    validatedCount++;
    imageCount += metadata.heroImages?.length || 0;
  }

  if (validatedCount > 0) {
    console.log(
      `✓ Validated ${validatedCount} series metadata file(s) with ${imageCount} hero image(s)`
    );
  }
}
