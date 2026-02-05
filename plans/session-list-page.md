# Session List Page (`/session/[id]/list`)

## Overview

Display all movies from a session in a browsable, actionable list. Users can review movies, mark their interest level, share with friends, find overlap, and eventually find showtimes for their selections.

---

## URL Structure

- `/session/[sessionID]/list` — main list view
- `/session/[sessionID]/list/[userRandId]/saved` — shareable saved list
- `/session/[sessionID]/compare/listA/listB` — compare two lists (2-person only)

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
- **"Want to see"** (Yes) — strong interest, prioritized in showtimes
- **"Maybe"** — uncertain interest, secondary priority
- **"No"** — explicit pass, visible to friends, recoverable
- **"More info"** — opens detail modal

### Reaction States
Three states per movie:
- **Yes** — "I want to see this"
- **Maybe** — "I might be interested"
- **No** — "I'll pass" (can be undone)

### Undo Behavior
- Tap the same button again to toggle off (unmark)
- "No" items are recoverable (filter to see them again)
- Also removable from the saved list view

### Button Feedback
When tapping a reaction button:
- Button fill/color change (outline → solid)
- Brief animation (pulse/pop)
- Card gets subtle border/glow in that state's color
- Colors loosely different per state (TBD during implementation)

---

## More Info Modal

### Content
- Ratings (IMDB, Rotten Tomatoes, Letterboxd)
- Trailer (embed or link)
- Genre tags
- External links (IMDB, Letterboxd, FF movie page)

### Actions
- **"Want to see" / "Maybe" / "No"** buttons (same as card)
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

When you receive a friend's shared list, you're **reacting to their picks**, not making a parallel list:
- See friend's list with their Yes/Maybe selections
- React with your own Yes/Maybe/No to each movie
- Your reactions stored in local storage + can be encoded in URL
- "No" reactions visible to friend as "you passed on this"

### Sharing Flow
1. Friend A shares their list URL
2. Friend B opens it, reacts to movies
3. Friend B shares compare link back
4. Both can view the same comparison at `/session/[id]/compare/listA/listB`

---

## Compare View

**Full page** (not modal): `/session/[sessionID]/compare/listA/listB`

**2-person compare only** — N-way comparison is a future consideration (likely requires accounts).

### Entry Points
- Direct link with two list IDs
- Paste/enter multiple list URLs
- "Compare with mine" button when viewing someone's shared list

### Sections (all expanded by default)

1. **Strong overlap** — Both said Yes
2. **Possible overlap** — One Yes + one Maybe, or both Maybe
3. **Disagreements** — One Yes + one No
4. **Mutual pass** — Both said No
5. **Unreviewed** — One or both haven't reacted yet

### Actions
- Change your own reaction (Yes/Maybe/No) inline
- Open More Info modal for a movie
- "Find Showtimes" for overlap (Strong + Possible sections)
- Share the comparison view itself
- Go back to the full list

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
- Card button feedback: fill change + pulse/pop + card glow

---

## User Flow

```
Session List Page
       │
       ├── Browse movies (list or card view)
       │   ├── Sort/filter as needed
       │   └── Toggle actors/blurb/images
       │
       ├── React to movies: "Want to see" / "Maybe" / "No"
       │   └── Tap again to unmark
       │
       ├── Open "More info" for details
       │   ├── Swipe through movies
       │   ├── React from modal
       │   └── Share individual movie
       │
       └── Bottom toolbar actions
           │
           ├── Review saved list (drawer)
           │   ├── Change status between sections
           │   ├── Remove items
           │   ├── Share list → generates URL
           │   └── "Find Showtimes" → /session/[id]/showtimes
           │
           └── Compare with friend
               └── /session/[id]/compare/listA/listB

Sharing Flow
       │
       ├── Friend A shares list URL
       ├── Friend B opens, reacts to movies
       ├── Friend B shares compare link
       └── Both view comparison (overlap, disagreements, etc.)
```

---

## Related Pages

- `/demo/blur-simple`, `/demo/blur-progressive` — image treatment prototypes
- `/session/[id]/showtimes` — TBD, next step in flow
- FilmForum movie pages — external links (URLs in JSON data)

---

## Future Considerations

- **N-way compare** (3+ people) — likely requires user accounts
- **Button feedback colors** — finalize during implementation
