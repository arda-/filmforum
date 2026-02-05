# Migration Plan: Main Route → `/series/[slug]/schedule`

## Overview

Move the schedule content from `/` to `/series/[slug]/schedule`, enabling:
- Landing page at `/` with intro, series picker, Film Forum links
- Future support for multiple series
- Future "my lists" feature at root level

## Phase 1: Extract Script Modules

Break `index.astro` ~600-line inline script into separate modules:

| Module | Responsibility |
|--------|----------------|
| `src/lib/schedule/calendarUtils.ts` | `formatDayLabel`, `parseTimeToMins`, `getDayTimeRange`, `generateDateRange`, `assignOverlapColumns` |
| `src/lib/schedule/movieFilters.ts` | `getHiddenWorkHoursMovies`, `getWeekdayMovies`, filter logic |
| `src/lib/schedule/urlState.ts` | `updateUrlParams`, `parseUrlParams`, URL ↔ UI sync |
| `src/lib/schedule/calendarRenderer.ts` | `createDayCell`, `renderCalendar`, `renderAllDays` |
| `src/lib/schedule/movieModal.ts` | `openMovieModal`, datetime formatting |
| `src/lib/schedule/hiddenMoviesModal.ts` | `renderMovieList`, `openWorkHoursModal`, `openWeekdayModal` |
| `src/lib/schedule/controls.ts` | Toggle handlers, `updateTileDisplayState`, hover highlighting |

## Phase 2: Reorganize Components

- Move `MovieModal`, `MovieTile` → `src/components/schedule/`
- Keep generic primitives (`Button`, `Switch`, `Toggle`, `ToggleGroup`, `Dialog`) in `src/components/`

## Phase 3: Create Route Structure

- Create `src/pages/series/[slug]/schedule.astro`

## Phase 4: Wire Up New Route

- Get schedule working at `/series/tenement-stories/schedule`
- Series metadata from JSON or manifest
- Scraped data stays in current location (scraping pipeline is fragile)

## Phase 5: Build Landing Page

- New `/` with:
  - 1-sentence intro
  - Series picker
  - Links to Film Forum

## Notes

- **Data**: JSON files organized by series, but constrained by scraping pipeline output location
- **Future**: "my lists" feature planned for root level
- **URL structure**: `/series/[slug]/schedule` allows for future `/series/[slug]/films`, `/series/[slug]/about`, etc.
