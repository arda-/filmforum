# Film Forum Development Log

## 2026-02-04: Unified MovieTile Layout & Visual Refinements

### Overview
Unified the internal layout of movie tiles so both timeline and non-timeline modes use the same structure: background-image with text overlaid at top. Previously, non-timeline mode used a separate `<img>` element with text below.

### Key Changes

1. **Unified Internal Structure**
   - Both modes now use `background-image` on the `.movie` element
   - Removed `movie-poster-wrapper` and `<img>` approach for non-timeline
   - Text positioned at top with gradient overlay in both modes

2. **Darken Blend Mode for Gradient**
   - Ported the demo page's darken blend mode solution to production
   - `mix-blend-mode: darken` with `rgba(17, 17, 17, 1)` gradient
   - Only darkens pixels lighter than the gradient color, preserving dark poster areas

3. **Consistent Flex Layout**
   - `.movie-clickable` always uses `display: flex` (not just in image mode)
   - Fixes line-height inconsistency when toggling images on/off

4. **Meta Text Styling in Image Mode**
   - Color: `rgba(255, 255, 255, 0.75)` (offwhite, softer than title)
   - Font-weight: 300 (lighter than default 400)
   - Added IBM Plex Sans weight 300 to Google Fonts loading

### Files Modified
- **`src/components/MovieTile/index.ts`** - Simplified to single structure for both modes
- **`src/components/MovieTile/styles.css`** - Generalized selectors from `.movie--timeline.has-poster` to `.movie.has-poster`, added darken blend mode
- **`src/layouts/Layout.astro`** - Added IBM Plex Sans weight 300

---

## 2026-02-04: CSS Extraction - Movie Tile Styles Consolidated

### Overview
Extracted movie tile styles from inline `<style>` blocks in both `/src/pages/index.astro` (~400 lines) and `/src/pages/demo/tile.astro` (~240 lines) into a shared `/src/styles/movie-tile.css` file. This refactoring eliminates style duplication while maintaining the functionality of dynamically-created tiles.

### Rationale for CSS File (not Astro Component)
Movie tiles are generated entirely through JavaScript (`createMovieElement()` function in index.astro), not via Astro templates. Since the DOM structure is built at runtime with `document.createElement()`, an Astro component would not be useful. A shared CSS file is the appropriate solution for maintaining consistent styling across both pages.

### Consolidated Styles
The extracted `src/styles/movie-tile.css` includes:

1. **Base Movie Tile Styles**
   - `.movie` - core tile container with positioning, colors, and responsive font sizes
   - `.movie-clickable` - wrapper for tile content
   - `.movie-header` - time and title container
   - `.movie-time` - accent-colored timestamp
   - `.movie-title` - film title text
   - `.movie-meta` - director, runtime, and actors metadata
   - `.movie-actors` - cast list (hidden at small viewports)

2. **Body Class Visibility Toggles**
   - `.show-year-director` / `.hide-year-director` - control year/director visibility
   - `.show-runtime` / `.hide-runtime` - control runtime visibility
   - `.show-actors` / `.hide-actors` - control actor list visibility
   - `.show-image` / `.hide-image` - control poster image visibility
   - Comma insertion logic between metadata fields

3. **Timeline Mode**
   - `.movie--timeline` - absolute positioned tiles with responsive left/right offsets
   - Poster image hidden (replaced with background image)
   - `.movie-clickable` flex layout for text at top of tile

4. **Poster & Gradient Overlay**
   - Background image and cover positioning for timeline mode
   - Content-based gradient overlay (`.movie-clickable::before`) with customizable height
   - Fade from fully opaque black to transparent

5. **Text Shadows**
   - Text shadows on time, title, and metadata for readability on poster backgrounds
   - Three-layer shadow: sharp inner (2px), medium (4px), soft outer (8px)

6. **Overlap Columns**
   - `.movie--timeline.overlap-col-1` - right column for overlapping showtimes
   - `.movie--timeline.overlap-col-0.has-overlap` - left column with overlap
   - Responsive breakpoint at 1024px

7. **Alternate Highlight**
   - `.alternate-highlight` - outline on all instances of a movie title on hover
   - Inset outline for border-like appearance

8. **Single Showtime Badge**
   - `.single-showtime-badge` - small star indicator for unique showtimes
   - Positioned top-right with accent color

### Files Modified
- **Created**: `/src/styles/movie-tile.css` (282 lines)
- **Updated**: `/src/layouts/Layout.astro` - added `@import '../styles/movie-tile.css'`
- **Updated**: `/src/pages/index.astro` - removed ~400 lines of CSS, kept page-specific JS logic
- **Updated**: `/src/pages/demo/tile.astro` - removed shared CSS (~240 lines), retained demo-specific gradient test styles

### Import Structure
```astro
<!-- In Layout.astro -->
<style is:global>
  @import '../styles/global.css';
  @import '../styles/movie-tile.css';
</style>
```

This ensures all pages using the Layout component have access to the shared movie tile styles without duplication.
