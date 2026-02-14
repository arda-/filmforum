# Plan: OMDb Integration

## Context

### What Exists

Movie data lives in `public/tenement-stories-full.json` with fields: Movie, Date, Time, ticket_url, Datetime, film_slug, country, year, director, actors, runtime, description, film_url, poster_url. There are no critic scores, audience ratings, or external plot summaries.

The data-processing pipeline is in `data-processing/` with `parse_showtimes.py` and poster processing scripts. Python is already established for data work.

The movie detail UI is in `src/components/MovieModal.astro` (a `DialogRoot`-based modal). The modal currently shows: poster, title, meta, actors, Film Forum description, buy tickets link, add to calendar, and film forum link.

`.env` is already in `.gitignore`.

### What We're Building

A parallel data source (`public/omdb-data.json`) fetched via OMDb API, joined at display time by title+year, adding IMDB/RT/Metacritic scores and a plot blurb to the movie modal.

### Key Constraints

- Film Forum data pipeline (`public/tenement-stories-full.json`) must remain untouched
- OMDb free tier: 1,000 requests/day, must rate-limit
- API key stored in `.env` (gitignored), output JSON committed to repo
- No React
- `pnpm build` must pass

## Components

1. **API Key Setup** -- `.env` configuration. Trivial complexity.
2. **Fetch Script** -- Python script to query OMDb, transform, and write JSON. Medium complexity (matching logic, rate limiting, idempotency).
3. **TypeScript Types** -- OMDb data interfaces. Low complexity.
4. **Data Loading** -- Load and join OMDb data with movie data at runtime. Low complexity.
5. **Modal UI Updates** -- Scores row, OMDb plot section, IMDB link, "Ratings unavailable" fallback. Medium complexity.

## Dependencies

```
API Key Setup (1) --> Fetch Script (2) --> Data File exists
                                              |
TypeScript Types (3) ----+                    |
                         +--> Modal UI (5) <--+
Data Loading (4) --------+
```

- Types (3), Data Loading (4) can be built in parallel with the fetch script (2), using a hand-crafted sample `omdb-data.json` for development
- Modal UI (5) depends on types, loading, and having data available

## Execution Plan

### Phase 1: Foundation (parallel tracks)

**Track A: Python Fetch Script**

- [ ] **1A.1: Create fetch script**
  - Create `data-processing/fetch_omdb.py`
  - Load movies from `public/tenement-stories-full.json` (read-only)
  - Extract unique title+year combinations
  - For each: query `GET http://www.omdbapi.com/?apikey=KEY&t=TITLE&y=YEAR`
  - If no match, retry without year
  - Transform to `OMDbEntry` format (keyed by `title::year`)
  - Rate limit: 1 request/second via `time.sleep(1)`
  - Skip films already in output file (idempotent re-runs)
  - Write to `public/omdb-data.json`
  - Log unmatched films to stderr

- [ ] **1A.2: Add manual overrides dict**
  - Known problem titles mapped to IMDB IDs for direct `?i=` lookup
  - Handle title normalization: lowercase, strip punctuation, "The" prefix handling

- [ ] **1A.3: Run fetch script and commit data**
  - Execute: `python data-processing/fetch_omdb.py`
  - Verify `public/omdb-data.json` has entries
  - Review any logged failures
  - Commit the data file

**Track B: TypeScript Types and Loading**

- [ ] **1B.1: Create OMDb types**
  - Add to `src/utils/movieUtils.ts` or create `src/types/omdb.ts`
  - `OMDbEntry` interface: `title`, `year`, `imdb_id`, `imdb_rating`, `rotten_tomatoes`, `metacritic`, `plot` (all nullable except title/year)
  - `OMDbData` type: `Record<string, OMDbEntry>`

- [ ] **1B.2: Create sample data file for development**
  - Create `public/omdb-data.json` with 2-3 hand-crafted entries
  - One entry with all scores, one with partial, one with none
  - This enables UI work before the fetch script runs

### Phase 2: Modal UI Updates (sequential)

- [ ] **2.1: Add scores row to MovieModal**
  - Modify `src/components/MovieModal.astro`
  - Add scores row HTML: `IMDB 7.2 . RT 88% . Meta 70`
  - Only show scores that are non-null; show "Ratings unavailable" when no OMDb match
  - Style the scores row with appropriate typography and spacing

- [ ] **2.2: Add OMDb plot section**
  - Add below Film Forum description (below the fold per wireframe)
  - Style as secondary quote with "-- OMDb" attribution
  - Show only when OMDb has plot data

- [ ] **2.3: Add IMDB external link**
  - Add "View on IMDB" link using `imdb_id` to construct URL: `https://www.imdb.com/title/{imdb_id}/`
  - Place alongside existing "View on Film Forum" link

- [ ] **2.4: Wire up data loading in page script**
  - Modify the schedule page (currently `src/pages/index.astro`, or the migrated route if migration happens first)
  - Fetch `/omdb-data.json` alongside movie data
  - Pass OMDb data to `openMovieModal()` function
  - Perform lookup by `${movie.Movie.toLowerCase()}::${movie.year}`

### Phase 3: Polish

- [ ] **3.1: Test all states**
  - Film with all three scores present
  - Film with partial scores (e.g., no Metacritic)
  - Film with no OMDb match at all
  - Film with plot but no scores
  - Verify dark mode and light mode rendering

- [ ] **3.2: Build verification**
  - Run `pnpm build` -- must pass

## Quality Gates

- [ ] `pnpm build` passes with zero errors
- [ ] Fetch script is idempotent (re-running does not duplicate entries)
- [ ] Modal correctly displays scores when available
- [ ] Modal shows "Ratings unavailable" gracefully when no OMDb match
- [ ] Film Forum data file is never modified by the fetch script
- [ ] Dark mode and light mode both render correctly

## Risks & Open Questions

1. **Title matching accuracy**: Film Forum movie titles may not exactly match OMDb titles. The plan mentions normalization and manual overrides, but the actual match rate is unknown until the script runs. Unmatched films get "Ratings unavailable" which is an acceptable fallback.

2. **API key availability**: The user needs to obtain an OMDb API key before Phase 1A can execute. This is a prerequisite outside the codebase.

3. **Ordering relative to Route Migration**: The plan references `src/pages/index.astro` for wiring, but if Route Migration happens first, the target file changes to `src/pages/series/[slug]/schedule.astro`. The OMDb changes are small enough that either order works, but the implementer should check which page is current.

4. **Ordering relative to Apple Drawer**: The plan wireframe shows a standard modal layout. The Apple Drawer plan shows a redesigned layout with the same data. If both are implemented, the OMDb sections will need to be adapted to the drawer layout. Recommendation: implement OMDb into the current modal first, then adapt when the drawer is built.

---

Written by Claude Opus 4.6 (claude-opus-4-6) at 2026-02-06
