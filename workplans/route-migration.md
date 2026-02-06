# Plan: Route Migration

## Context

### What Exists

The entire application currently lives at `/` in a single file: `src/pages/index.astro` (~1065 lines). This file contains ~800 lines of inline `<script>` handling calendar rendering, movie filtering, URL state management, modal management, and hover highlighting. All logic is tightly coupled to the single page.

Key files involved:
- `src/pages/index.astro` -- the monolith page
- `src/components/MovieModal.astro` -- movie detail modal
- `src/components/MovieTile/index.ts` -- tile rendering
- `src/utils/movieUtils.ts` -- Movie interface and helpers
- `src/constants/index.ts` -- calendar constants
- `src/styles/calendar.css` -- calendar grid CSS
- `public/tenement-stories-full.json` -- movie data

### What We're Building

Move the schedule from `/` to `/series/[slug]/schedule`, extract the inline script into importable modules, reorganize components into domain folders, and create a new landing page at `/`.

### Key Constraints

- No React -- all interactivity via Astro `<script>` tags with vanilla JS/TS
- `pnpm build` must pass after every phase
- Scraping pipeline output locations (`public/tenement-stories-*.json`) must not change
- Currently only one series ("tenement-stories") but architecture should support more
- Astro dynamic routes require `getStaticPaths()` for static builds

## Components

1. **Script Module Extraction** -- Break the ~800-line inline script into 7 importable TS modules. High complexity (largest risk of regressions).
2. **Component Reorganization** -- Move `MovieModal`, `MovieTile` into `src/components/schedule/`. Low complexity.
3. **Route Structure** -- Create `/series/[slug]/schedule` dynamic route with `getStaticPaths()`. Low complexity.
4. **Route Wiring** -- Get the schedule working at the new URL with the extracted modules. Medium complexity.
5. **Landing Page** -- New `/` page with intro, series picker, Film Forum links. Low complexity.

## Dependencies

```
Script Module Extraction (1)
    |
    +--> Route Structure (3) --+--> Route Wiring (4) --> Landing Page (5)
    |                          |
    +--> Component Reorg (2) --+
```

- Component Reorg (2) and Route Structure (3) can happen in parallel once extraction (1) is done
- Route Wiring (4) requires all three predecessors
- Landing Page (5) can technically be built in parallel with Wiring (4) but depends on the route structure existing

## Execution Plan

### Phase 1: Script Module Extraction (sequential -- highest risk)

- [ ] **1.1: Extract calendar utilities**
  - Create `src/lib/schedule/calendarUtils.ts`
  - Move: `formatDayLabel`, `parseTimeToMins`, `getDayTimeRange`, `generateDateRange`, `assignOverlapColumns`
  - Note: `parseTimeToMins` and `assignOverlapColumns` already exist in `src/utils/movieUtils.ts` -- decide whether to deduplicate or keep schedule-specific versions
  - Modify `src/pages/index.astro` to import from new module

- [ ] **1.2: Extract movie filters**
  - Create `src/lib/schedule/movieFilters.ts`
  - Move: `getHiddenWorkHoursMovies`, `getWeekdayMovies`, filter logic from `renderAllDays()`, `updateHoursFilterStatus`
  - Note: Filter functions also exist in `src/utils/movieUtils.ts` -- same deduplication question

- [ ] **1.3: Extract URL state management**
  - Create `src/lib/schedule/urlState.ts`
  - Move: `updateUrlParams`, URL parsing logic from `DOMContentLoaded` handler
  - Export: `updateUrlParams()`, `parseUrlParams()`, `applyUrlParams()`

- [ ] **1.4: Extract calendar renderer**
  - Create `src/lib/schedule/calendarRenderer.ts`
  - Move: `createDayCell`, `renderCalendar`, `renderAllDays`
  - These functions reference DOM directly -- they will remain client-side script imports

- [ ] **1.5: Extract movie modal logic**
  - Create `src/lib/schedule/movieModal.ts`
  - Move: `openMovieModal`, `formatDateTime`, `formatShowtime`, modal DOM manipulation

- [ ] **1.6: Extract hidden movies modal logic**
  - Create `src/lib/schedule/hiddenMoviesModal.ts`
  - Move: `renderMovieList`, `openWorkHoursModal`, `openWeekdayModal`

- [ ] **1.7: Extract control handlers**
  - Create `src/lib/schedule/controls.ts`
  - Move: Toggle handlers, `updateTileDisplayState`, hover highlighting, `isTogglePressed`, `setToggleState`, `getToggleInput`, confirm dialog logic
  - Export: `initControls()` function that wires all event listeners

- [ ] **1.8: Verify extraction**
  - The `<script>` block in index.astro should now be ~30-50 lines: imports + initialization calls
  - Run `pnpm build` -- must pass with zero errors
  - Manual test: all calendar features still work (timeline toggle, filters, modals, URL state)

### Phase 2: Reorganize and Route (parallel tracks)

**Track A: Component Reorganization**

- [ ] **2A.1: Create schedule component directory**
  - Create `src/components/schedule/`
  - Move `src/components/MovieModal.astro` to `src/components/schedule/MovieModal.astro`
  - Move `src/components/MovieTile/` to `src/components/schedule/MovieTile/`
  - Move `src/components/CalendarGrid.astro` to `src/components/schedule/CalendarGrid.astro`
  - Move `src/components/DayCell.astro` to `src/components/schedule/DayCell.astro`
  - Update all import paths in `src/pages/index.astro`
  - Run `pnpm build`

**Track B: Create Route Structure**

- [ ] **2B.1: Create series route**
  - Create `src/pages/series/[slug]/schedule.astro` with placeholder content
  - Implement `getStaticPaths()` returning `[{ params: { slug: 'tenement-stories' } }]`
  - Create a series config: `src/config/series.ts` mapping slugs to data files and metadata
  - Run `pnpm build` to verify route generates

### Phase 3: Wire Up New Route (sequential)

- [ ] **3.1: Port schedule to new route**
  - Copy the slimmed-down index.astro content to `src/pages/series/[slug]/schedule.astro`
  - Replace hardcoded "tenement-stories" references with dynamic `Astro.params.slug`
  - Load series metadata from config
  - Load movie data from `public/{slug}-full.json`
  - All imports should point to the extracted modules in `src/lib/schedule/` and components in `src/components/schedule/`
  - Verify schedule works at `/series/tenement-stories/schedule`

- [ ] **3.2: Add redirect from old route**
  - Temporarily redirect `/` to `/series/tenement-stories/schedule` so existing users are not broken
  - This is a placeholder until the landing page is built

### Phase 4: Build Landing Page

- [ ] **4.1: Create landing page**
  - Create new `src/pages/index.astro` (replacing the schedule content)
  - Content: 1-sentence intro to FilmForum, series picker (currently just one series), links to Film Forum website
  - Use existing Layout and Header components
  - Series picker reads from `src/config/series.ts`

- [ ] **4.2: Final cleanup**
  - Remove any remaining dead code from old index.astro
  - Verify all routes work: `/`, `/series/tenement-stories/schedule`
  - Run `pnpm build`

## Quality Gates

- [ ] `pnpm build` passes after each phase
- [ ] All calendar features work identically at new route (timeline, filters, modals, URL state, hover highlights)
- [ ] No duplicate code between extracted modules and `src/utils/movieUtils.ts`
- [ ] Landing page renders with series link
- [ ] Dark mode and light mode both render correctly

## Risks & Open Questions

1. **Duplicate utility functions**: `parseTimeToMins`, `assignOverlapColumns`, `getDayTimeRange`, and filter functions exist in both the inline script AND `src/utils/movieUtils.ts`. During extraction, decide whether to consolidate into one location or keep schedule-specific copies. Consolidating is cleaner but increases the blast radius of changes.

2. **DOM-dependent modules**: Several extracted modules (`calendarRenderer.ts`, `controls.ts`, `movieModal.ts`) directly manipulate DOM elements. They can only be imported in client-side `<script>` tags, not in Astro frontmatter. This is a pattern constraint, not a bug, but worth noting.

3. **Data file location**: The plan says "scraped data stays in current location (scraping pipeline is fragile)." The JSON files in `public/` must remain where they are. The new route loads them by slug-based filename convention.

4. **Single series limitation**: Currently only "tenement-stories" exists. The series config and `getStaticPaths()` will only return one entry. The architecture supports more, but there is no test data for a second series.

---

Written by Claude Opus 4.6 (claude-opus-4-6) at 2026-02-06
