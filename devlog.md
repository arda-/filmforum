# Film Forum Development Log

## 2026-02-04: Progressive Blur Demo Pages

### Overview
Created two standalone demo pages to prototype blur techniques for potential use on movie tile text overlays. The goal is to improve text readability over poster images with a more sophisticated blur effect than simple opacity gradients.

### Two Techniques Explored

1. **Simple Blur Fade** (`/demo/blur-simple`)
   - Single `backdrop-filter: blur()` layer with `mask-image: linear-gradient()`
   - Fades the blur layer to transparent, but blur intensity stays constant
   - Simpler implementation, fewer DOM elements
   - Limitation: Can't create true intensity gradient

2. **Progressive Blur** (`/demo/blur-progressive`)
   - 7 stacked layers with doubling blur values: 1px → 2px → 4px → 8px → 16px → 32px → 64px
   - Each layer masked to a different vertical region with overlap for smoothness
   - Creates true "Apple-style" blur where intensity increases gradually
   - Trade-off: More DOM elements, potential performance impact

### Key Technical Insights

- **Mask processing order**: `mask-image` on `backdrop-filter` only affects opacity, not blur intensity
- **Layer overlap is critical**: Each layer needs ~7% overlap with adjacent layers to avoid visible banding
- **Safari support**: `-webkit-backdrop-filter` and `-webkit-mask-image` required for Safari
- **Performance**: 7 layers with blur is GPU-intensive; may need to limit to hover states or reduce layer count

### Demo Features
- Interactive controls to adjust blur amount and mask positions (simple)
- **Direction control** (simple): Bottom, Top, Left, Right - text overlay moves to match
- Toggle individual layers on/off to see contribution (progressive)
- Side-by-side comparison of both techniques
- Visual layer mask diagram showing coverage regions

### Important: Blur Direction
The blur must be at the **same edge as the text overlay**. Initial implementation had blur at top but text at bottom - fixed by reversing gradient direction to `to top` (blur strongest at bottom where text lives).

### Files Created
- `src/pages/demo/blur-simple.astro` - Single-layer blur demo
- `src/pages/demo/blur-progressive.astro` - 7-layer progressive blur demo
- `docs/progressive-blur-guide.md` - Implementation guide

### Files Modified
- `src/pages/demo/index.astro` - Added links to blur demos

### Iteration & Refinements
The initial implementation required significant iteration to get right:

1. **Blur direction mismatch**: First version had blur at TOP of image but text overlay at BOTTOM - completely backwards. Fixed by reversing gradient direction.

2. **Confusing control labels**: Went through several iterations:
   - "Mask start/end" → too technical
   - "Blur start/end" → ambiguous
   - "Clear above/Full effect" → still confusing
   - Final: **"100% blur until"** and **"Blur ends at"** - describes what you see

3. **Percentage direction confusion**: Initial values were inverted (stored 85 but meant 15%). Simplified to direct values that match what's displayed.

4. **Control panel organization**: Took multiple passes to get logical grouping:
   - Row 1: Direction (alone)
   - Row 2: Blur radius (alone)
   - Row 3: 100% blur until / Blur ends at / Debug
   - Row 4: Text / Shadow

5. **Removed hero card**: Originally had a large "main" Taxi Driver card above the aspect ratio grid - removed to show all demos equally.

6. **Aspect ratio ordering**: Reordered from widest to tallest (2:1 → 16:9 → 4:3 → 1:1 → 3:4 → 2:3 → 9:16 → 1:2).

7. **URL parameter persistence**: Added for all controls so configurations can be shared/bookmarked.

**Lesson learned**: Demo pages benefit from extensive iteration on UX. What seems "obvious" in code often isn't obvious in the UI.

### Next Steps
- Test performance impact on actual movie tiles
- Consider reduced layer count (5 instead of 7) for better performance
- Evaluate whether effect is worth the complexity vs simpler gradient overlay

### References
- [Progressive blur in CSS](https://kennethnym.com/blog/progressive-blur-in-css/) - Multi-layer technique
- [Josh Comeau: Backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/) - Mask-image processing order

---

## 2026-02-04: Color Palette Demo & Iterative Refinement

### Overview
Created a new `/demo/colors` page to help refine the app's light mode color palette. The original palette had too many distinct grays (5 background colors) creating visual noise. Through iterative feedback, narrowed down to 3 focused scenarios.

### Key Changes

1. **Colors Demo Page**
   - Shows multiple color palette scenarios side-by-side
   - Loads actual movie data so hierarchy can be judged with real content
   - Floating control bar at bottom for display toggles (Year/Director, Image, Runtime, Actors)
   - URL state persistence for toggle settings

2. **Iterative Scenario Refinement**
   - Started with 5+ scenarios (A, B, B2, B3, C, D, E)
   - User feedback drove removal: C, D, E rejected; B2 (no grid color) rejected
   - Final scenarios: A (Original), B (Flatten Day Cells), B2 (Border Structure)

3. **Technical Fixes**
   - B2 border discontinuities fixed by setting `gap: 0` and using collapsed borders with negative margin
   - Toggle state saved to URL params (`?meta=1&image=1`) for shareable configurations

### Patterns & Learnings
- **Demo pages are for exploration**: Creating multiple scenarios lets the user see options side-by-side and reject quickly
- **Iterative refinement works**: Started broad, narrowed based on feedback rather than guessing the "right" answer upfront
- **CSS grid gap + borders don't mix well**: When using borders for structure, set gap to 0 and collapse borders manually
- **URL state for demos**: Makes it easy to share specific configurations and preserves state across refreshes

### Files Modified
- **Created**: `src/pages/demo/colors.astro` - Color palette comparison demo
- **Updated**: `src/pages/demo/index.astro` - Added colors demo to hub

---

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
