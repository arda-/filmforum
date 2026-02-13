# Quick Pick Feature — Design Research

> "I'm free Friday evening, what can I see?"

## Problem

Finding a compatible movie requires too many manual steps:

```
┌─────────────────────────────────────────────────────────┐
│  TODAY: User wants to find a movie for Friday evening   │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ Open     │───>│ Go to        │───>│ Manually scan │  │
│  │ calendar │    │ Friday's col │    │ evening times │  │
│  └──────────┘    └──────────────┘    └───────┬───────┘  │
│                                              │          │
│                                              v          │
│                                      ┌───────────────┐  │
│                                      │ Cross-ref w/  │  │
│                                      │ my Yes/Maybe  │  │
│                                      │ reactions     │  │
│                                      └───────────────┘  │
│                                                         │
│  That's 3-4 mental steps for a simple question.         │
└─────────────────────────────────────────────────────────┘
```

The existing filter bar has **time categories** (weekdays / weeknights / weekends) and **reaction filters** (yes / maybe / no / unmarked), but they operate on the *whole* calendar. There's no way to say "show me just **this** Friday evening" and get an instant answer.

### What exists today

| Feature | Where | What it does |
|---|---|---|
| Time category filters | Calendar filter bar | Toggle weekdays / weeknights / weekends globally |
| Reaction filters | Calendar filter bar | Toggle yes / maybe / no / unmarked globally |
| `classifyTimeCategory()` | `calendarFilters.ts` | Categorizes a movie as weekday / weeknight / weekend |
| `applyFilterPipeline()` | `calendarFilters.ts` | Chains time + reaction filters, updates hidden counts |
| URL state persistence | `calendarUrlState.ts` | Saves all filter/view settings to query params |

The building blocks for time classification and reaction filtering already exist — Quick Pick would compose them with a **date-specific** constraint.

---

## Open Design Questions

### 1. Input Model — How does the user express availability?

```
  A) Single slot          B) Multi-slot             C) Free-form range
  ┌──────────────┐        ┌──────────────┐          ┌──────────────┐
  │ Fri evening  │        │ Fri evening  │          │ Fri 6pm-10pm │
  │              │        │ Sat afternoon│          │ Sat 1pm-5pm  │
  │              │        │ Sun morning  │          │              │
  └──────────────┘        └──────────────┘          └──────────────┘
```

**Option A — Single slot (day + broad time-of-day)**
- Simplest to build and use
- Reuses existing time categories (morning / afternoon / evening)
- May be too coarse for users who know exact windows

**Option B — Multi-slot**
- Handles "I'm free Friday or Saturday evening"
- More complex input UI, but still uses broad categories
- Useful for planning-ahead use cases

**Option C — Free-form time range**
- Maximum flexibility ("I'm free 6-9pm")
- Requires a time-range picker (more complex UI)
- May be overkill if most users think in broad slots

### 2. Scope — What happens to non-matching movies?

```
  Option A: Filter down              Option B: Highlight in-place
  ┌─────────────────────┐            ┌─────────────────────┐
  │ Only show matching  │            │ Show full calendar   │
  │ movies, hide rest   │            │ but GLOW the matches │
  │                     │            │  ░░░░░░░░░░░░░░░░░  │
  │ ▓▓ Movie A  7:00pm │            │  ▓▓ Movie A  7:00pm │
  │ ▓▓ Movie B  7:30pm │            │  ░░ Movie C  2:00pm │
  │ ▓▓ Movie C  8:15pm │            │  ▓▓ Movie B  7:30pm │
  │                     │            │  ░░ Movie D  3:00pm │
  └─────────────────────┘            └─────────────────────┘
```

**Option A — Filter down (hide non-matches)**
- Clean, focused result
- Loses spatial/temporal context
- Consistent with how existing filters work

**Option B — Highlight in-place (dim non-matches)**
- Preserves full calendar context
- User can see what's nearby if plans shift
- More visually complex

### 3. Reaction Cross-Referencing — Smart or dumb?

**Dumb mode**: Pure time match — "here's everything playing Friday evening."

**Smart mode**: Factor in existing reactions — sort/badge results by yes > maybe > unmarked > no.

```
  ┌──────────────────────────────────────────┐
  │  ★ Movie A  7:00pm   ← you said YES     │
  │  ★ Movie B  7:30pm   ← you said YES     │
  │  · Movie C  8:15pm   ← unmarked          │
  │  · Movie D  8:45pm   ← unmarked          │
  │  ○ Movie E  9:00pm   ← you said MAYBE    │
  └──────────────────────────────────────────┘
```

Smart mode adds minimal implementation cost since reactions are already in localStorage, and it directly answers "what should I see?" rather than just "what's playing?"

### 4. Entry Point — Where does this live in the UI?

```
  A) Floating action     B) Filter bar        C) Dedicated       D) Landing page
     button (FAB)           extension            panel              widget

  ┌──────────────┐      ┌──────────────┐     ┌────────────┐    ┌──────────────┐
  │              │      │ Filters...   │     │ "What can  │    │ What can I   │
  │              │      │ ┌──────────┐ │     │  I see?"   │    │ see tonight? │
  │              │      │ │Quick Pick│ │     │            │    │ [Fri] [6pm]  │
  │          [⚡]│      │ └──────────┘ │     │ [Fri][Eve] │    │   → 3 films  │
  └──────────────┘      └──────────────┘     │ [Go]       │    └──────────────┘
                                             └────────────┘
```

| Option | Pros | Cons |
|---|---|---|
| **A) FAB** | Discoverable, always accessible | Floating buttons can feel generic; another thing on screen |
| **B) Filter bar extension** | Colocated with existing filters; natural discovery | Filter bar may get crowded |
| **C) Dedicated panel** | Room for richer input; clear affordance | Extra navigation step |
| **D) Landing page widget** | Answers the question before you even open the calendar | Only works for "tonight" / "today"; limited scope |

Options are not mutually exclusive — D could be a lightweight version that links into B or C for full control.

### 5. Primary Use Case

| Use case | Implications |
|---|---|
| **Day-of decisions** ("What's playing tonight?") | Default to today; needs quick, low-friction input; landing page widget makes sense |
| **Planning ahead** ("When should I go this week?") | Multi-day input; results span multiple days; calendar integration is key |
| **Group coordination** ("We're both free Saturday afternoon") | Needs to cross-reference two users' reactions; ties into existing compare feature |

These aren't mutually exclusive but the *primary* one determines what ships in v1.

---

## Existing Code to Build On

Quick Pick doesn't need to start from scratch. Key infrastructure:

- **`classifyTimeCategory()`** in `calendarFilters.ts` — already categorizes movies as weekday/weeknight/weekend
- **`filterByTimeCategories()`** — applies the category filter to a movie list
- **`filterBySavedStatus()`** — applies reaction-based filtering
- **`applyFilterPipeline()`** — chains both filters together
- **`parseTimeToMins()`** in `calendarTime.ts` — parses showtime strings into minutes-since-midnight (useful for custom time ranges)
- **`getReactions()`** in `storageManager.ts` — reads reaction data from localStorage
- **`aggregateMoviesForDate()`** in `movieUtils.ts` — groups movies by date (already used on landing page for "Showing Today")

A minimal implementation could compose `aggregateMoviesForDate()` + `filterByTimeCategories()` + `filterBySavedStatus()` with a date picker to get 80% of the value.

---

## Possible Implementation Sketch

```
User taps "Quick Pick"
        │
        v
┌─────────────────────────┐
│  Select a date          │  ← Day picker (scrollable chips or calendar tap)
│  [Today] [Fri] [Sat]   │
└───────────┬─────────────┘
            │
            v
┌─────────────────────────┐
│  Select a time window   │  ← Reuse existing time categories
│  [Morning] [Afternoon]  │
│  [Evening] [Any]        │
└───────────┬─────────────┘
            │
            v
┌─────────────────────────┐
│  Results                │
│                         │
│  ★ Movie A    7:00pm    │  ← Sorted: yes > maybe > unmarked
│  ★ Movie B    7:30pm    │  ← Reaction badges inline
│  · Movie C    8:15pm    │
│                         │
│  3 movies match         │
│  [View in Calendar →]   │  ← Link to calendar with filters pre-applied
└─────────────────────────┘
```

---

## Status

**Phase**: Early design exploration — no decisions made yet.

Questions 1, 4, and 5 are the highest-leverage decisions. Resolving those will determine the shape of v1.
