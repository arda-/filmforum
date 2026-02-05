# Session List Page (`/session/[id]/list`)

## Overview

Display all movies from a session in a browsable, actionable list. Users can review movies, mark their interest level, share with friends, find overlap, and eventually find showtimes for their selections.

---

## URL Structure

- `/session/[sessionID]/list` — main list view
- `/session/[sessionID]/list/[userRandId]/saved` — shareable saved list
- `/session/[sessionID]/compare/listA/listB` — compare two lists

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
  - Uses blur-simple/blur-progressive treatment from demos

---

## Page Layout

### Top Toolbar (List Header)
- View mode toggle (list / card)
- Toggle controls:
  - Show actors
  - Show blurb
  - Show images (card view only)
- Sort/filter controls

### Sorting Options
- Alphabetical
- Year
- Genre
- Director
- Already-marked status

### Bottom Floating Toolbar
Always visible (even with 0 saved):
- **Bookmark icon** with count badge
  - Badge animates when count changes
- **"Review Saved"** button — opens saved list drawer
- **"Find Showtimes"** button — navigates to showtimes page

---

## Card Actions

Each card has quick-action buttons:
- **"Want to see"** — strong interest, prioritized in showtimes
- **"Maybe"** — uncertain interest, secondary priority
- **"More info"** — opens detail modal

### Undo Behavior
- Tap the same button again to toggle off (unmark)
- Also removable from the saved list view

---

## More Info Modal

### Content
- Ratings (IMDB, Rotten Tomatoes, Letterboxd)
- Trailer (embed or link)
- Genre tags
- External links (IMDB, Letterboxd, FF movie page)

### Actions
- **"Want to see" / "Maybe"** buttons (same as card)
- **Share this movie** — link opens directly to this modal
- **Showtimes nudge**: No direct shortcut. If attempted, shows nudge modal: "Complete your watchlist first." Override option takes user to the FilmForum movie page (link already in JSON data).

### Navigation
- Swipeable left/right to browse prev/next movie without closing

### Animation
- Vaul-style drawer (custom Astro implementation, no React dependencies)
- Swipe-to-dismiss

---

## Saved List View

### UI
- Slides up as a modal/drawer (Vaul-style)
- URL-routable for sharing: `/session/[sessionID]/list/[userRandId]/saved`

### Layout
Two sections:
- **"Want to see"** — top priority
- **"Maybe"** — secondary

### Actions
- Change status (move between sections)
- Remove items
- Share list
- "Find Showtimes" button

### Empty State
- Message: "No movies saved yet"
- Hint: "Tap 'Want to see' or 'Maybe' on any movie to start building your list"
- Optional illustration (empty bookmark, film reel)

---

## Persistence & Sharing

### Storage
- **Local storage** for persistence
- **URL encoding** for shareable links

### Share Mechanics
- Copy link button
- Native share sheet
- Share button disabled until count > 0 (can't share empty lists)

### Recipient Experience
- Sender's picks shown as **read-only overlay**
- Recipient makes their own independent picks
- Can then compare via the compare view

---

## Compare View

**Full page** (not modal): `/session/[sessionID]/compare/listA/listB`

### Entry Points
- Direct link with two list IDs
- Paste/enter multiple list URLs
- "Compare with mine" button when viewing someone's shared list

### Features
- Shows overlap ("movies you both want to see")
- Shows each person's unique picks

### Empty State (No Overlap)
- Message explaining no overlap found
- Prompt: "Check out some of their recommendations, or share some of yours"

---

## Visual Direction

- Follow existing design patterns in codebase
- Card view images use **blur-simple/blur-progressive** treatment

### Animations
- Vaul-style drawer (custom Astro, no React)
- Badge count animation when saving
- View toggle: simple swap, no transition
- Card button feedback: **TBD**

---

## User Flow

```
Session List Page
       │
       ├── Browse movies (list or card view)
       │   ├── Sort/filter as needed
       │   └── Toggle actors/blurb/images
       │
       ├── Mark movies: "Want to see" / "Maybe"
       │   └── Tap again to unmark
       │
       ├── Open "More info" for details
       │   ├── Swipe through movies
       │   ├── Mark/unmark from modal
       │   └── Share individual movie
       │
       └── Bottom toolbar actions
           │
           ├── Review saved list (drawer)
           │   ├── Reorder between sections
           │   ├── Remove items
           │   ├── Share list → generates URL
           │   └── "Find Showtimes" → /session/[id]/showtimes
           │
           └── Compare with friend
               └── /session/[id]/compare/listA/listB
```

---

## Related Pages

- `/demo/blur-simple`, `/demo/blur-progressive` — image treatment prototypes
- `/session/[id]/showtimes` — TBD, next step in flow
- FilmForum movie pages — external links (URLs in JSON data)

---

## Open Questions

- **Card button feedback**: What interaction/animation when tapping "Want to see" / "Maybe"?
- **Compare UX details**: Exact flow for entering comparison mode
