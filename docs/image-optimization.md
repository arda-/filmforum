# Image Optimization Strategy

## Overview

FilmForum implements a **build-time image optimization strategy** using Astro's built-in `Image` component and a manifest-based approach for managing poster images. This ensures:

- **Automatic format conversion** (PNG → WebP/AVIF)
- **Responsive image generation** (srcsets for different screen sizes)
- **Build-time validation** of image data
- **Lazy loading** by default
- **Zero runtime overhead** for image optimization

## Architecture

### 1. Poster Image Manifest (`src/config/posterImages.ts`)

The manifest maintains an explicit registry of all available poster images:

```typescript
// Automatically discovers all images in src/assets/posters/*.png
const posterImages = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/posters/*.png',
  { eager: true }
);
```

**Key functions:**

- `getPosterImage(posterUrl)` - Lookup function for getting image modules
- `validatePosterImages(movies)` - Build-time validation that all movie data has corresponding images
- `listAvailablePosterImages()` - Debug utility to see available posters

### 2. Build-Time Validation (`astro.config.mjs`)

An integration hook validates poster data at build start:

```javascript
const validatePosterImages = {
  name: 'validate-poster-images',
  hooks: {
    'astro:build:start': async () => {
      // Loads all series data and validates every movie has a poster image
      // Throws error if any poster is missing - fails the build fast
    }
  }
};
```

**Why this matters:** If a new movie is added to the JSON but the poster image is missing, the build will fail with a clear error message. This prevents production deploys with incomplete data.

### 3. Image Storage

**Build-time optimized images:**
- Location: `src/assets/posters/`
- Format: PNG source files
- Used by: Components with static image references (MovieCard, landing page)
- Optimization: Astro converts to WebP/AVIF, generates responsive srcsets

**Runtime-accessible images:**
- Location: `public/posters/`
- Used by: Dynamic components (MovieModal, MovieDetailDrawer)
- Note: These are served as-is (not optimized) for dynamic src assignment

## Adding New Movies

When adding new movies to the Film Forum schedule:

### 1. Create/Obtain Poster Image

Get the poster image for the new movie and save it as:
```
src/assets/posters/movie-title-slug.png
```

Example: `src/assets/posters/taxi-driver.png`

### 2. Update JSON Data

Add the movie entry to the appropriate series JSON file with:
```json
{
  "Movie": "Taxi Driver",
  "Time": "7:00 PM",
  "Datetime": "2024-02-15T19:00:00",
  "poster_url": "/posters/taxi-driver.png",
  "director": "Martin Scorsese",
  "year": "1976",
  "runtime": "114 minutes"
}
```

**Important:** The `poster_url` filename must match the image filename in `src/assets/posters/`

### 3. Build & Validate

Run the build:
```bash
pnpm build
```

The build will:
- ✅ Auto-discover the new poster image
- ✅ Validate it exists in the manifest
- ✅ Optimize it (convert to WebP/AVIF)
- ✅ Generate responsive srcsets
- ❌ FAIL if the image is missing (fast feedback)

## Components Using Image Optimization

### Static Image Components

These use Astro's `Image` component and get full optimization:

#### MovieCard.astro
- Used in: Session lists, calendar grid
- Image size: 400×300 (4:3 aspect ratio)
- Gets: WebP/AVIF conversion, lazy loading, responsive srcsets

#### Landing Page (index.astro)
- Used in: Homepage "Showing Today" gallery
- Image size: 145×193 (3:4 aspect ratio)
- Gets: WebP/AVIF conversion, lazy loading, responsive srcsets

### Dynamic Image Components

These components set image `src` at runtime and cannot use Astro's Image component:

#### MovieModal.astro
- Image populated dynamically via JavaScript
- Uses: Runtime img tag with lazy loading
- Falls back to: `public/posters/` directory

#### MovieDetailDrawer.astro
- Image populated dynamically via JavaScript
- Uses: Runtime img tag with lazy loading
- Falls back to: `public/posters/` directory

## Performance Impact

### File Size Reduction

Original PNG files (src/assets/posters/):
- Total: ~65 MB
- Average file: 1.3 MB

After Astro optimization (build output):
- WebP format: ~15-20 MB total (75% reduction)
- AVIF format: ~10-15 MB total (80% reduction)

Modern browsers receive WebP/AVIF automatically, older browsers get fallback PNG.

### Runtime Performance

- **Lazy loading**: Images load only when visible (reduces initial page load)
- **Responsive images**: Browser picks optimal resolution for device (reduces bandwidth)
- **No build overhead**: Optimization happens once at build time, not at runtime
- **Content-visibility optimization**: Calendar tiles defer rendering of off-screen items

## Maintenance Checklist

When working with images:

- [ ] New poster? Add to `src/assets/posters/`
- [ ] New movie in data? Ensure `poster_url` filename matches image filename
- [ ] Running build? Wait for validation to pass (ensures data integrity)
- [ ] Debugging images? Use `listAvailablePosterImages()` from posterImages.ts
- [ ] Missing image error? Check filename matches between JSON and `src/assets/posters/`

## Troubleshooting

### Build Error: "Missing poster images for: Movie Title"

**Cause:** A movie in the JSON references a poster that doesn't exist

**Solution:**
1. Check the `poster_url` in the JSON data
2. Verify the image exists in `src/assets/posters/` with matching filename
3. If missing, add the image file and re-run build

### Image Not Showing in Dev/Build

**Check:**
1. Does the image exist in `src/assets/posters/`?
2. Does the filename match the `poster_url` in JSON exactly (case-sensitive)?
3. Is the file a valid PNG?

### Performance Still Slow?

**Verify:**
- Calendar tiles have `content-visibility: auto` (defers off-screen rendering)
- All poster images have `loading="lazy"` attributes
- Images are being served in WebP/AVIF format (check browser DevTools)

## Future Enhancements

- [ ] Blur-up placeholder strategy (show low-quality blur while optimized loads)
- [ ] Different aspect ratio variants for tablet/mobile layouts
- [ ] Automatic poster download from Film Forum API (when available)
- [ ] Image quality optimization tuning (balance between size and visual quality)
