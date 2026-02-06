# Plan: Session List Page

## Context

### What Exists

The FilmForum project is an Astro + webcoreui application (no React) built around a Film Forum movie series. The current codebase contains:

- **Layout & styling**: `src/layouts/Layout.astro`, `src/styles/global.css` with dark/light mode CSS variables
- **Components**: `Button.astro`, `Toggle.astro`, `ToggleGroup.astro`, `Switch.astro`, `Dialog.astro`, `DialogRoot.astro`, `MovieModal.astro`, `Header.astro`, `MovieTile/index.ts`
- **Data**: Movie JSON at `public/tenement-stories-full.json` with fields: Movie, Date, Time, Tickets, Datetime, country, year, director, actors, runtime, description, film_url, poster_url
- **Utilities**: `src/utils/movieUtils.ts` (Movie interface, formatting helpers)
- **Blur demos**: `src/pages/demo/blur-simple.astro` and `blur-progressive.astro` with backdrop-filter blur + mask-image techniques
- **Tile demo**: `src/pages/demo/tile.astro` with poster background tiles and gradient overlays
- **No existing session pages**: The `src/pages/session/` directory does not exist yet
- **No localStorage usage** anywhere in the codebase currently
- **No genre data** in the current Movie JSON (sorting by genre will require either adding genre data or omitting that sort option initially)

### What We're Building

A multi-page session list feature at `/session/[id]/list` that lets users browse movies, react with Yes/Maybe/No, save selections to localStorage, share lists via URL, and compare lists between two people. This includes a vaul-style drawer modal built in vanilla Astro (no React), a floating bottom toolbar with badge, and a compare view.

### Key Constraints

- **No React** -- all interactivity via Astro `<script>` tags with vanilla JS/TS
- **webcoreui** for any available utility components
- **pnpm** for package management
- **`pnpm build` must pass** before any push
- Data source is currently a static JSON file; the "session" concept is currently just a wrapper around one series

## Components

1. **Session Data Layer** -- TypeScript types for sessions, user lists, reactions; data loading utilities. Low complexity.
2. **Local Storage Manager** -- Persistence layer for reactions and user lists with URL encoding/decoding for sharing. Medium complexity.
3. **Movie List Item** -- Text list view component for a single movie row. Low complexity.
4. **Movie Card** -- Card/tile view component with poster image, blur treatment, and reaction buttons. Medium complexity.
5. **Reaction Buttons** -- Yes/Maybe/No button group with toggle, fill/color change, pulse animation, and card glow. Medium complexity.
6. **Top Toolbar** -- View mode toggle, display toggles (actors, blurb, images), sort/filter controls. Low complexity (reuses existing Toggle/ToggleGroup).
7. **Bottom Floating Toolbar** -- Fixed toolbar with bookmark icon + count badge (animated), "Review Saved" button, "Find Showtimes" button. Medium complexity.
8. **Vaul-Style Drawer** -- Custom drawer component with slide-up animation, swipe-to-dismiss, and swipe-to-navigate. This is the highest-complexity new component. High complexity.
9. **More Info Modal** -- Movie detail content inside the drawer: ratings, trailer, genre tags, external links, reaction buttons, and left/right swipe navigation. Medium complexity.
10. **Saved List Drawer** -- Drawer showing saved movies in "Want to see" and "Maybe" sections with status change, removal, share, and empty state. Medium complexity.
11. **Session List Page** -- Main page at `/session/[id]/list` composing all of the above. Medium complexity.
12. **Compare View Page** -- Full page at `/session/[id]/compare/[listA]/[listB]` with overlap/disagreement sections, inline reaction changes, and share functionality. Medium-high complexity.
13. **URL Sharing System** -- Encoding user reactions into URL-safe format, generating share links, handling incoming shared list URLs. Medium complexity.

## Dependencies

```
Session Data Layer (1)
    |
    +---> Local Storage Manager (2)
    |         |
    |         +---> URL Sharing System (13)
    |
    +---> Movie List Item (3) ----+
    |                              |
    +---> Movie Card (4) ---------+---> Session List Page (11)
    |         |                    |
    +---> Reaction Buttons (5) ---+
    |                              |
    +---> Top Toolbar (6) --------+
    |                              |
    +---> Bottom Floating Toolbar (7) ---+
    |                                     |
    +---> Vaul-Style Drawer (8) ---------+
              |                           |
              +---> More Info Modal (9) --+
              |                           |
              +---> Saved List Drawer (10)+
                                          |
                                          +---> Compare View Page (12)
```

- Components 3, 4, 5, 6, 7, 8 can be built in parallel once the data layer (1) is established
- More Info Modal (9) and Saved List Drawer (10) depend on Drawer (8)
- Session List Page (11) integrates everything
- Compare View (12) depends on URL Sharing (13) and the data layer

## Execution Plan

### Phase 1: Foundation (sequential)

- [ ] **1.1: Session data types and loading utilities**
  - Create `src/types/session.ts` -- types for `Session`, `MovieReaction` (yes/maybe/no/none), `UserList`, `ReactionMap`
  - Create `src/utils/sessionUtils.ts` -- helpers for loading session data, deduplicating movies across showtimes (the current JSON has one entry per showtime, not per unique movie -- the list page needs unique movies)
  - Modify `src/utils/movieUtils.ts` -- extend the `Movie` interface if needed, or re-export from the new types

- [ ] **1.2: Local storage manager**
  - Create `src/utils/storageManager.ts` -- `getReactions(sessionId)`, `setReaction(sessionId, movieId, reaction)`, `clearReactions(sessionId)`, `getUserListId()` (generates random ID on first use), `exportToUrl()`, `importFromUrl()`
  - Storage key format: `filmforum_reactions_{sessionId}`
  - URL encoding: base64 encode a compact JSON representation of reactions

- [ ] **1.3: Create session page directory structure**
  - Create Astro dynamic route: `src/pages/session/[id]/list.astro` (placeholder)
  - Create Astro dynamic route: `src/pages/session/[id]/compare/[...lists].astro` (placeholder)
  - Verify build passes with placeholder pages

### Phase 2: Core Components (parallel tracks)

**Track A: View Components**

- [ ] **2A.1: Movie list item component**
  - Create `src/components/session/MovieListItem.astro` -- compact text row showing title, year/director/runtime, optionally actors and blurb
  - Props: movie data, display toggles, reaction state

- [ ] **2A.2: Movie card component**
  - Create `src/components/session/MovieCard.astro` -- card with optional poster image using blur treatment from demos
  - Two-column grid layout for cards
  - Reuse blur-simple technique from `src/pages/demo/blur-simple.astro`
  - Props: movie data, display toggles (actors, blurb, images), reaction state

**Track B: Interaction Components**

- [ ] **2B.1: Reaction button group**
  - Create `src/components/session/ReactionButtons.astro` -- three buttons (Yes/Maybe/No) with toggle behavior
  - CSS for fill/color transitions, pulse animation on tap, card glow effect
  - Dispatches custom events for reaction changes
  - Each button has two visual states: outline (unselected) and solid (selected)
  - Define color scheme for each state (e.g., green for Yes, amber for Maybe, muted for No)

- [ ] **2B.2: Bottom floating toolbar**
  - Create `src/components/session/BottomToolbar.astro` -- fixed position bar
  - Bookmark icon with animated count badge (CSS counter animation)
  - "Review Saved" button that opens saved list drawer
  - "Find Showtimes" button (links to future showtimes page or shows placeholder)
  - Listen for reaction change events to update count

**Track C: Drawer Component**

- [ ] **2C.1: Vaul-style drawer base**
  - Create `src/components/Drawer.astro` -- generic drawer component
  - Slide-up animation from bottom
  - Backdrop overlay with click-to-close
  - Swipe-to-dismiss (touch event handling for drag down to close)
  - CSS transitions for smooth open/close
  - Escape key to close
  - Body scroll lock when open
  - This replaces the existing Dialog pattern for mobile-friendly bottom sheets

- [ ] **2C.2: More info modal content**
  - Create `src/components/session/MovieDetailDrawer.astro` -- content template for drawer
  - Sections: poster, title, meta, ratings placeholders (IMDB/RT/Letterboxd), trailer embed/link, genre tags, external links
  - Includes reaction buttons (same component from 2B.1)
  - Share this movie button
  - Showtimes nudge modal (mini dialog within drawer)
  - Left/right swipe or arrow navigation to browse prev/next movie

**Track D: Top Toolbar**

- [ ] **2D.1: Top toolbar**
  - Create `src/components/session/ListToolbar.astro`
  - View mode toggle (list/card) -- reuse existing `ToggleGroup.astro`
  - Display toggles: show actors, show blurb, show images (card only) -- reuse existing `Toggle.astro` or `Switch.astro`
  - Sort select: alphabetical, year, director, already-marked status (genre omitted initially since data lacks genre field)
  - Body class toggling for show/hide fields (pattern already established in tile demo)

### Phase 3: Page Assembly (sequential, depends on Phase 2)

- [ ] **3.1: Session list page**
  - Implement `src/pages/session/[id]/list.astro`
  - Load session data (currently hardcoded to "tenement-stories" -- session ID maps to JSON file)
  - Deduplicate movies (group by movie title, keep unique films)
  - Render top toolbar, movie list/cards, bottom toolbar
  - Client-side script: wire up all interactions (view toggle, display toggles, sort, reaction buttons, storage, drawer opening)
  - Handle URL params for initial state (view mode, sort, etc.)

- [ ] **3.2: Saved list drawer integration**
  - Create `src/components/session/SavedListDrawer.astro`
  - Uses Drawer component from 2C.1
  - Two sections: "Want to see" (Yes reactions) and "Maybe" (Maybe reactions)
  - Each item shows title + meta, with inline status change (move between sections) and remove
  - Share list button (generates URL with user's random ID)
  - "Find Showtimes" button
  - Empty state with message and hint
  - Wire into bottom toolbar "Review Saved" button

### Phase 4: Sharing and Compare (depends on Phase 3)

- [ ] **4.1: URL sharing system**
  - Extend `src/utils/storageManager.ts`
  - Encode reactions as compact URL-safe string (e.g., movie indices mapped to reaction codes: y/m/n)
  - Generate shareable URL: `/session/[id]/list/[userRandId]/saved`
  - Create route: `src/pages/session/[id]/list/[userId]/saved.astro`
  - When visiting a shared URL: decode the list, show friend's selections, allow reacting to each
  - Copy link button with native clipboard API
  - Native share sheet (navigator.share) with fallback

- [ ] **4.2: Compare view page**
  - Implement `src/pages/session/[id]/compare/[...lists].astro`
  - Parse two list IDs from URL (e.g., `/compare/abc123/def456`)
  - Decode both lists from URL params
  - Compute sections: Strong overlap (both Yes), Possible overlap (Yes+Maybe or both Maybe), Disagreements (Yes+No), Mutual pass (both No), Unreviewed
  - Render each section with expandable movie items
  - Inline reaction change for your own list
  - "More Info" modal for any movie
  - "Find Showtimes" for overlap sections
  - Share the comparison URL
  - "Back to full list" link
  - Empty state when no overlap found

### Phase 5: Polish (parallel)

- [ ] **5.1: Animations and transitions**
  - Badge count animation (CSS keyframes for bounce/scale on count change)
  - Reaction button pulse/pop animation
  - Card glow effect on reaction state (subtle border color transition)
  - View mode swap (no transition per spec, just swap)
  - Drawer open/close spring animation tuning

- [ ] **5.2: Responsive and accessibility**
  - Mobile-first card grid (1 column on small screens, 2 columns on medium+)
  - Touch targets minimum 44px
  - ARIA attributes on reaction buttons (aria-pressed), drawer (aria-modal, role="dialog")
  - Focus management: trap focus in drawer when open, restore on close
  - Keyboard navigation: arrow keys in more info modal for prev/next movie
  - Reduce motion media query for animations

- [ ] **5.3: Demo page**
  - Create `src/pages/demo/session-list.astro`
  - Link from demo index at `src/pages/demo/index.astro`
  - Showcase the drawer, reaction buttons, and card components in isolation

## Quality Gates

- [ ] `pnpm build` passes with zero errors at each phase completion
- [ ] All pages render correctly in dev mode (`pnpm dev`)
- [ ] Drawer swipe-to-dismiss works on both mouse and touch
- [ ] Local storage persistence survives page reload
- [ ] Shared URLs correctly encode and decode reaction data
- [ ] Compare view correctly categorizes movies into overlap sections
- [ ] Dark mode and light mode both render correctly (CSS variables are already in place)
- [ ] No React dependencies introduced

## Risks & Open Questions

1. **Missing genre data**: The current Movie JSON has no `genre` field. The spec calls for sort-by-genre. Options: (a) add genre data to the JSON, (b) omit genre sort initially, (c) derive genre from description. Recommendation: omit genre sort for now, add it when data is available.

2. **Movie deduplication**: The JSON has entries per showtime, not per unique movie. The list page needs unique movies. The deduplication logic needs to handle the same movie appearing at different times/dates. Using `Movie.Movie` (title) as the unique key is straightforward but should be validated against the data.

3. **Ratings data**: The spec mentions IMDB, Rotten Tomatoes, and Letterboxd ratings in the more info modal. This data is not in the current JSON. Options: (a) add ratings to JSON, (b) link to external sites only, (c) scrape/fetch at build time. Recommendation: show external links initially, add ratings data later.

4. **Vaul-style drawer complexity**: Building a smooth, spring-animated, swipe-dismissable drawer in vanilla JS without a library is non-trivial. The existing Dialog component provides a simpler modal pattern. The drawer needs careful touch event handling, velocity-based dismiss decisions, and smooth CSS transitions. This is the highest-risk component.

5. **Session ID mapping**: Currently there's only one series (tenement-stories). The `[id]` route param needs to map to a data source. For now, this can be a simple lookup table in a config file. The architecture should support multiple sessions later.

6. **Static site constraints**: Astro builds static pages by default. Dynamic routes with `[id]` require either `getStaticPaths()` with known session IDs at build time, or switching to SSR mode. Since there is currently only one session, `getStaticPaths()` returning a single entry is the simplest approach.

7. **Shareable URL data size**: Encoding all reactions in a URL could make URLs very long if there are many movies. For ~30 movies, a compact encoding (2 bits per movie) would be about 8 bytes, which base64 encodes to ~11 characters. This is manageable.

8. **Trailer embeds**: The spec mentions trailer embeds. YouTube embeds work but add significant page weight. Consider lazy-loading or just linking to trailers.

---

Written by Claude Opus 4.6 (claude-opus-4-6) at 2026-02-06
