// @ts-check
import { defineConfig } from 'astro/config';
import { webcore } from 'webcoreui/integration';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

// Build-time validation + thumbnail generation
const validatePosterImages = {
  name: 'validate-poster-images',
  hooks: {
    'astro:build:start': async () => {
      const sharp = await import('sharp');

      // Import validation function
      const { validatePosterImages: validate } = await import('./src/config/posterImages.ts');

      // Load and validate movie data from the series config
      const { getActiveSeries } = await import('./src/config/series.ts');
      const activeSeries = getActiveSeries();

      let allMovies = [];
      for (const series of activeSeries) {
        const dataPath = path.join(process.cwd(), 'public', series.dataFile);
        try {
          const movieData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
          allMovies = allMovies.concat(movieData);
        } catch (e) {
          if (e.code !== 'ENOENT') {
            console.error(`Error loading series data for ${series.id}:`, e);
          }
        }
      }

      // Run validation - will throw if posters are missing
      if (allMovies.length > 0) {
        validate(allMovies);
        console.log(`✓ Validated ${allMovies.length} movies have poster images`);
      }

      // Validate series metadata files and hero images
      const { validateSeriesMetadata } = await import('./src/config/seriesMetadata.ts');
      validateSeriesMetadata(activeSeries);

      // Generate tiny thumbnail images for modal fast loading
      const thumbDir = path.join(process.cwd(), 'public/posters-thumb');
      if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
      }

      const posterDir = path.join(process.cwd(), 'src/assets/posters');
      const posterFiles = fs.readdirSync(posterDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));

      for (const file of posterFiles) {
        const input = path.join(posterDir, file);
        const output = path.join(thumbDir, file.replace(/\.(png|jpg|jpeg)$/i, '.jpg'));

        try {
          await sharp.default(input)
            .resize(100, 133, { fit: 'cover' })
            .blur(5)
            .jpeg({ quality: 30, progressive: true })
            .toFile(output);
        } catch (e) {
          console.warn(`Failed to generate thumbnail for ${file}:`, e.message);
        }
      }
    }
  }
};

// https://astro.build/config
export default defineConfig({
  // Set SITE environment variable for production builds
  // Falls back to localhost for local development
  site: process.env.SITE || 'http://localhost:4321',
  integrations: [
    webcore(),
    validatePosterImages,
    sitemap({
      filter: (page) =>
        !page.includes('/demo/') &&
        !page.includes('/list/saved') &&
        !page.includes('/compare/'),
    })
  ]
});
