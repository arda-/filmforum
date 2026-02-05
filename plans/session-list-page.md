# Session List Page (`/session/[id]/list`)

## Overview

Display all movies from a session in a browsable, actionable list. Users can review movies, mark their interest level, and eventually find showtimes for their selections.

---

## Display Modes

### Text List View
A compact list showing:
- **Title**
- **Year / Director / Runtime** (single line)
- **Actors** (toggleable)
- **Blurb** (toggleable)

### Card/Tile View
Two-column grid of cards. Each card shows:
- **Title**
- **Year / Director / Runtime**
- **Actors** (toggleable)
- **Blurb** (toggleable)
- **Image** (optional toggle)
  - When enabled, use the blur/overlap technique from `/demo/blur`

---

## Toggle Controls

Global toggles (probably in a control bar):
- [ ] Show actors
- [ ] Show blurb
- [ ] Show images (card view only)

---

## Card Actions

Each card has quick-action buttons:
- **"Want to see"** — strong interest
- **"Maybe"** — uncertain interest
- **"More info"** — opens modal (see below)

---

## More Info Modal

**TBD — Questions to resolve:**

1. What additional info should this show beyond what's on the card?
   - Full cast list?
   - Plot summary (longer than blurb)?
   - Reviews/ratings?
   - Trailer link?
   - Links to external sites (IMDB, Letterboxd)?

2. Should the modal have its own actions?
   - Same "Want to see" / "Maybe" buttons?
   - Share this specific movie?
   - Jump directly to showtimes for just this movie?

3. Any navigation from the modal?
   - Swipe/arrow to next/prev movie?
   - Or close-only?

---

## Floating Toolbar

Persistent bottom toolbar with:
- **Bookmark icon** with count badge
  - Count increases when user marks "Want to see" or "Maybe"
- **Review list** action
  - Opens the user's saved selections
  - Can send/share this list to friends
- **"Find Showtimes"** button
  - Navigates to `/session/[id]/showtimes`
  - Uses the saved selections as input

---

## User Flow

```
Session List Page
       │
       ├── Browse movies (list or card view)
       ├── Mark movies: "Want to see" / "Maybe"
       ├── Open "More info" for details
       │
       └── Tap bookmark → Review saved list
                │
                ├── Share with friends
                └── "Find Showtimes" → /session/[id]/showtimes (TBD)
```

---

## Open Questions

1. **Sorting/filtering?**
   - Alphabetical, by year, by runtime?
   - Filter by genre?

2. **Undo/remove from saved list?**
   - How does user un-mark a movie?

3. **Persistence?**
   - Local storage? Account-based?
   - What happens if they leave and come back?

4. **Share mechanics?**
   - Copy link? Native share?
   - Does recipient see same list or their own blank slate?

5. **Distinction between "Want to see" vs "Maybe"?**
   - Different visual treatment in the saved list?
   - Filter showtimes differently?

---

## Related Pages

- `/demo/blur` — image blur/overlap technique prototype
- `/session/[id]/showtimes` — TBD, next step in flow
