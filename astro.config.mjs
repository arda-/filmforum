// @ts-check
import { defineConfig } from 'astro/config';
import { webcore } from 'webcoreui/integration';
import fs from 'node:fs';
import path from 'node:path';

// Build-time validation integration
const validatePosterImages = {
  name: 'validate-poster-images',
  hooks: {
    'astro:build:start': async () => {
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
    }
  }
};

// https://astro.build/config
export default defineConfig({
  integrations: [webcore(), validatePosterImages]
});
